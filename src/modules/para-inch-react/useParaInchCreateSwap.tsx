import { buildContext, createSwap as createSkybridgeSwap } from '@swingby-protocol/sdk';
import { Big } from 'big.js';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';

import {
  CreateSwapMutationVariables,
  useCreateSwapMutation,
} from '../../generated/skypools-graphql';
import { logger } from '../logger';
import { Network } from '../networks';
import { useOnboard } from '../onboard';
import { buildParaTxData, isFakeBtcToken, isFakeNativeToken } from '../para-inch';
import { buildSkypoolsContract, getSkypoolsContractAddress } from '../skypools';

import { useParaInchForm } from './useParaInchForm';
import { useParaInchSwapApproval } from './useParaInchSwapApproval';

export const useParaInchCreateSwap = () => {
  const { address, wallet, network: onboardNetwork } = useOnboard();
  const { swapQuote, network, slippage, fromToken } = useParaInchForm();

  const skypoolsContractAddress = getSkypoolsContractAddress(network);
  const paraSwapContractAddress = swapQuote?.bestRoute.spender;

  const isSkypoolsContract = swapQuote && isFakeBtcToken(swapQuote.destToken.address);

  const { isApprovalNeeded, approve } = useParaInchSwapApproval({
    token: swapQuote?.srcToken.address,
    spender: isSkypoolsContract ? skypoolsContractAddress : paraSwapContractAddress,
    network,
  });

  const [createSwap] = useCreateSwapMutation();
  const { push } = useRouter();

  return useMemo(() => {
    return {
      isApprovalNeeded,
      approve,
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
              rawRouteData: swapQuote.rawRouteData,
              srcAmount: swapQuote.srcTokenAmount,
              beneficiaryAddress: address,
            },
          });
          if (!swap) {
            throw new Error(`Could not create swap in DB`);
          }

          return push(`/swap/${swap.createSwap.id}`);
        };

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
          const web3 = new Web3(wallet.provider);
          const contract = buildSkypoolsContract({ provider: skypoolsContractAddress, network });
          const isNativeToken = isFakeNativeToken(swapQuote.srcToken.address);

          const srcTokenDecimals = fromToken?.decimals;

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
            to: skypoolsContractAddress,
            data,
          };

          const gasPrice = await web3.eth.getGasPrice();
          const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
          logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');

          return web3.eth
            .sendTransaction({ ...transaction, gasPrice, gas })
            .once('transactionHash', async (hash) => {
              return callCreateSwap({ skypoolsTransactionHash: hash });
            });
        } else {
          const paraTx: TransactionConfig = await buildParaTxData({
            priceRoute: JSON.parse(swapQuote.rawRouteData),
            slippage,
            userAddress: address,
          });

          const web3 = new Web3(wallet.provider);
          const gasPrice = await web3.eth.getGasPrice();
          const { chainId, ...transaction } = paraTx;
          const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
          logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');

          return web3.eth
            .sendTransaction({ ...transaction, gas, gasPrice })
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
    slippage,
    skypoolsContractAddress,
    fromToken,
  ]);
};
