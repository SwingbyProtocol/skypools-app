import { buildContext, createSwap as createSkybridgeSwap } from '@swingby-protocol/sdk';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { AbiItem } from 'web3-utils';
import { Big } from 'big.js';

import ABI from '../../abi/skypools.json'; // eslint-disable-line import/no-internal-modules
import {
  useCreateSwapMutation,
  CreateSwapMutationVariables,
} from '../../generated/skypools-graphql';
import { useOnboard } from '../onboard';
import { isFakeBtcToken } from '../para-inch';
import { Network } from '../networks';
import { CONTRACT_SKYPOOLS } from '../env';
import { logger } from '../logger';

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
  const [createSwap] = useCreateSwapMutation();
  const { push } = useRouter();

  console.log('useParaInchCreateSwap');
  console.log('network', network);
  console.log('isApprovalNeeded', isApprovalNeeded);
  console.log('swapQuote', swapQuote);

  return useMemo(() => {
    return {
      isApprovalNeeded,
      approve,
      createSwap: async () => {
        console.log('createSwap', createSwap);
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
          console.log('callCreateSwap');
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
          console.log('swap', swap);

          return push(`/swap/${swap.createSwap.id}`);
        };

        const web3 = new Web3(wallet.provider);
        const skypools = CONTRACT_SKYPOOLS[network];
        const contract = new web3.eth.Contract(ABI as AbiItem[], skypools);

        if (isFakeBtcToken(swapQuote.srcToken.address)) {
          console.log('swap from fakeBtc');
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
          console.log('token to BTC');
          console.log('token', swapQuote.srcToken.address);
          console.log(
            'amount',
            web3.utils.toHex(new Big(swapQuote.srcTokenAmount).times(`1e${18}`).toFixed()),
          );

          const transaction: TransactionConfig = {
            nonce: await web3.eth.getTransactionCount(address),
            value: '0x0',
            from: address,
            to: skypools,
            data: contract.methods
              .spDeposit(
                swapQuote.srcToken.address,
                web3.utils.toHex(new Big(swapQuote.srcTokenAmount).times(`1e${18}`).toFixed()),
              )
              .encodeABI(),
          };

          console.log('transaction', transaction);

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

          const spDepositResult = await web3.eth.sendTransaction({
            ...transaction,
            gasPrice,
            gas,
          });

          console.log('spDepositResult', spDepositResult);

          return spDepositResult;
          // return web3.eth
          //   .sendTransaction({ ...transaction, gasPrice, gas })
          //   .once('transactionHash', async (hash) => {
          //     return callCreateSwap({ skypoolsTransactionHash: hash });
          //   });
        } else {
          console.log('token to token');
          const web3 = new Web3(wallet.provider);
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
  ]);
};
