import { buildContext, createSwap as createSkybridgeSwap } from '@swingby-protocol/sdk';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { Big } from 'big.js';
import { ParaSwap } from 'paraswap';

import ABI from '../../abi/skypools.json'; // eslint-disable-line import/no-internal-modules
import {
  useCreateSwapMutation,
  CreateSwapMutationVariables,
} from '../../generated/skypools-graphql';
import { useOnboard } from '../onboard';
import { isFakeBtcToken, isFakeNativeToken } from '../para-inch';
import { Network } from '../networks';
import { CONTRACT_SKYPOOLS } from '../env';
import { logger } from '../logger';
import { getDecimals } from '../web3';

import { useParaInchForm } from './useParaInchForm';
import { useParaInchSwapApproval } from './useParaInchSwapApproval';

export const useParaInchCreateSwap = () => {
  const { address, wallet, network: onboardNetwork } = useOnboard();
  const { swapQuote, network } = useParaInchForm();
  const { isApprovalNeeded, approve } = useParaInchSwapApproval({
    token: swapQuote?.srcToken.address,
    spender: swapQuote?.bestRoute.spender,
    network,
  });
  console.log('swapQuote', swapQuote);

  const skypools = CONTRACT_SKYPOOLS[network];
  const { isApprovalNeeded: isSpApprovalNeeded, approve: spApprove } = useParaInchSwapApproval({
    token: swapQuote?.srcToken.address,
    spender: skypools,
    network,
  });

  const [createSwap] = useCreateSwapMutation();
  const { push } = useRouter();

  return useMemo(() => {
    return {
      isApprovalNeeded,
      approve,
      isSpApprovalNeeded,
      spApprove,
      createSwap: async () => {
        if (!swapQuote) {
          throw new Error('No swap quote available to create a new swap');
        }

        if (!address || !wallet || !wallet.provider) {
          throw new Error('No wallet connected');
        }

        if (onboardNetwork !== network) {
          throw new Error("Swap quote network does not match wallet's network");
        }

        if (isApprovalNeeded) {
          throw new Error('Spender needs approval before creating a swap');
        }

        const callCreateSwap = async (
          params: Pick<CreateSwapMutationVariables, 'skypoolsTransactionHash' | 'skybridgeSwapId'>,
        ) => {
          const { data: swap } = await createSwap({
            variables: {
              ...params,
              network,
              initiatorAddress: address,
              destTokenId: swapQuote.destToken.id,
              srcTokenId: swapQuote.srcToken.id,
              paraSwapRate: JSON.stringify(swapQuote),
              srcAmount: swapQuote.srcTokenAmount,
              beneficiaryAddress: address,
            },
          });
          if (!swap) {
            throw new Error(`Could not create swap in DB`);
          }

          return push(`/swap/${swap.createSwap.id}`);
        };

        const web3 = new Web3(wallet.provider);
        const contract = new web3.eth.Contract(ABI as AbiItem[], skypools);

        if (isFakeBtcToken(swapQuote.srcToken.address)) {
          const context = await buildContext({
            mode: network === Network.ROPSTEN ? 'test' : 'production',
          });

          const { hash } = await createSkybridgeSwap({
            context,
            addressReceiving: address,
            amountDesired: swapQuote.srcTokenAmount,
            currencyDeposit: 'BTC',
            currencyReceiving: network === 'BSC' ? 'BTCB.BEP20' : 'WBTC',
            isSkypoolsSwap: true,
          });

          return callCreateSwap({ skybridgeSwapId: hash });
        } else if (isFakeBtcToken(swapQuote.destToken.address)) {
          const isNativeToken = isFakeNativeToken(swapQuote.srcToken.address);
          const srcTokenDecimals = !isNativeToken
            ? await getDecimals({
                token: swapQuote.srcToken.address,
                provider: wallet.provider,
              })
            : 18;

          const value = isNativeToken ? web3.utils.toWei(swapQuote.srcTokenAmount) : '0x0';

          const data = contract.methods
            .spDeposit(
              swapQuote.srcToken.address,
              isNativeToken
                ? '0'
                : web3.utils.toHex(
                    new Big(swapQuote.srcTokenAmount).times(`1e${srcTokenDecimals}`).toFixed(),
                  ),
            )
            .encodeABI();

          const transaction: TransactionConfig = {
            nonce: await web3.eth.getTransactionCount(address),
            value,
            from: address,
            to: skypools,
            data,
          };

          const gasPrice = await web3.eth.getGasPrice();
          const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
          if (!gas) {
            logger.warn(transaction, 'Did not get any value from estimateGas(): %s', gas);
          } else {
            logger.debug(
              transaction,
              'Estimated gas that will be spent %s (price: %s ETH)',
              gas,
              web3.utils.fromWei(gasPrice, 'ether'),
            );
          }

          return web3.eth
            .sendTransaction({ ...transaction, gasPrice, gas })
            .once('transactionHash', async (hash) => {
              return callCreateSwap({ skypoolsTransactionHash: hash });
            });
        } else {
          const web3 = new Web3(wallet.provider);
          const paraSwap = new ParaSwap();
          // const txParams = await paraSwap.buildTx(
          //   swapQuote?.srcToken.address,
          //   swapQuote?.destToken.address,
          //   swapQuote?.srcTokenAmount,
          //   // destAmount: swapQuote?.,
          //   priceRoute,
          //   address,
          //   'skypools',
          // );
          // console.log('txParams', txParams);

          const transaction: TransactionConfig = {
            // TODO
            nonce: await web3.eth.getTransactionCount(address),
            value: '0x0',
            from: address,
          };

          const gasPrice = await web3.eth.getGasPrice();
          const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
          return web3.eth
            .sendTransaction({ ...transaction, gasPrice, gas })
            .once('transactionHash', async (hash) => {
              return callCreateSwap({ skypoolsTransactionHash: hash });
            });
        }
      },
    };
  }, [
    address,
    approve,
    createSwap,
    isApprovalNeeded,
    network,
    onboardNetwork,
    push,
    swapQuote,
    wallet,
    skypools,
    isSpApprovalNeeded,
    spApprove,
  ]);
};
