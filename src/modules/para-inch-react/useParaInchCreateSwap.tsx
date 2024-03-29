import { buildContext, createSwap as createSkybridgeSwap } from '@swingby-protocol/sdk';
import { Big } from 'big.js';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';

import {
  CreateSwapMutationVariables,
  useCreateSwapMutation,
} from '../../generated/skypools-graphql';
import { logger } from '../logger';
import { Network } from '../networks';
import {
  buildParaTxData,
  buildSkypoolsContract,
  getSkypoolsContractAddress,
  isFakeBtcToken,
  isFakeNativeToken,
} from '../para-inch';
import { useWalletConnection } from '../hooks/useWalletConnection';

import { useParaInchForm } from './useParaInchForm';
import { useParaInchSwapApproval } from './useParaInchSwapApproval';

export const useParaInchCreateSwap = () => {
  const { address, wallet, network: onboardNetwork } = useWalletConnection();
  const { swapQuote, network, slippage, fromToken, amount, toToken } = useParaInchForm();
  const [createSwapError, setCreateSwapError] = useState<string>('');

  const contractAddress =
    swapQuote && isFakeBtcToken(swapQuote.destToken.address)
      ? getSkypoolsContractAddress(network)
      : swapQuote?.bestRoute.spender;

  const { isApprovalNeeded, approve } = useParaInchSwapApproval({
    token: swapQuote?.srcToken.address,
    spender: contractAddress,
    network,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [createSwap] = useCreateSwapMutation();
  const { push } = useRouter();
  const isFromBtc = fromToken?.symbol === 'BTC';
  const isToBtc = toToken?.symbol === 'BTC';

  useEffect(() => {
    setCreateSwapError('');
  }, [fromToken, amount, toToken]);

  return useMemo(() => {
    return {
      isApprovalNeeded: isFromBtc ? false : isApprovalNeeded,
      isQuote: !!(amount && swapQuote),
      isSkypools: isToBtc || isFromBtc,
      isLoading,
      approve,
      createSwapError,
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

        if (isApprovalNeeded && !isFromBtc) {
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

        try {
          setIsLoading(true);
          if (isFakeBtcToken(swapQuote.srcToken.address)) {
            const context = await buildContext({
              mode: network === Network.ROPSTEN ? 'test' : 'production',
            });

            const { hash } = await createSkybridgeSwap({
              context,
              addressReceiving: address,
              amountDesired: swapQuote.srcTokenAmount,
              currencyDeposit: 'BTC',
              currencyReceiving: 'WBTC.SKYPOOL',
              isSkypoolsSwap: true,
            });

            return callCreateSwap({ skybridgeSwapId: hash });
          }
          if (isFakeBtcToken(swapQuote.destToken.address)) {
            const web3 = new Web3(wallet.provider);
            const contract = buildSkypoolsContract(network);
            const isNativeToken = isFakeNativeToken(swapQuote.srcToken.address);

            const data = contract.methods
              .spDeposit(
                swapQuote.srcToken.address,
                isNativeToken
                  ? '0'
                  : web3.utils.toHex(
                      new Big(swapQuote.srcTokenAmount).times(`1e${fromToken?.decimals}`).toFixed(),
                    ),
              )
              .encodeABI();

            const transaction: TransactionConfig = {
              nonce: await web3.eth.getTransactionCount(address),
              value: isNativeToken ? web3.utils.toWei(swapQuote.srcTokenAmount) : '0x0',
              from: address,
              to: contractAddress,
              data,
            };

            const gasPrice = await web3.eth.getGasPrice();
            const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
            logger.debug(
              { transaction: { ...transaction, gas, gasPrice } },
              'Will send transaction',
            );

            return web3.eth
              .sendTransaction({ ...transaction, gasPrice, gas })
              .once('transactionHash', async (hash) => {
                return callCreateSwap({ skypoolsTransactionHash: hash });
              });
          }
          const web3 = new Web3(wallet.provider);
          const transaction: TransactionConfig = await buildParaTxData({
            priceRoute: JSON.parse(swapQuote.rawRouteData),
            slippage,
            userAddress: address,
          });

          return web3.eth.sendTransaction(transaction).once('transactionHash', async (hash) => {
            return callCreateSwap({ skypoolsTransactionHash: hash });
          });
        } catch (err: any) {
          logger.error(err);
          setCreateSwapError(err.message);
        } finally {
          setIsLoading(false);
        }
      },
    };
  }, [
    createSwapError,
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
    contractAddress,
    fromToken,
    isFromBtc,
    isLoading,
    amount,
    isToBtc,
  ]);
};
