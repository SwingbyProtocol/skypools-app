import { ethers } from 'ethers';
import { useEffect, useMemo, useState, useCallback } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';

import {
  SwapDocument,
  SwapStatus,
  useSwapQuery,
  useUpdateSwapMutation,
} from '../../generated/skypools-graphql';
import { logger } from '../logger';
import {
  buildSkypoolsContract,
  getERC20Address,
  getSkypoolsContractAddress,
  getWrappedBtcAddress,
} from '../para-inch';
import { useWalletConnection } from '../hooks/useWalletConnection';

export const useSkypoolsDeposit = (swapId: string) => {
  const { address, wallet, network: onboardNetwork } = useWalletConnection();

  const [updateSwap] = useUpdateSwapMutation();
  const { data } = useSwapQuery({
    query: SwapDocument,
    variables: { id: swapId },
  });

  const [depositBalance, setDepositBalance] = useState<{ balance: string; token: string }>({
    balance: '',
    token: '',
  });

  const isBtcToToken = data?.swap.srcToken.symbol === 'BTC';

  const depositInformation = useCallback(async () => {
    if (!wallet || !address || !data) return;
    const { network, srcToken } = data.swap;

    const contract = buildSkypoolsContract(network);
    const token = isBtcToToken
      ? getWrappedBtcAddress(network)
      : getERC20Address({ network, tokenAddress: data.swap.srcToken.address });
    const rawRouteData = JSON.parse(data.swap.rawRouteData);
    const rawBal = await contract.methods.balanceOf(token, address).call();
    const decimals = rawRouteData.srcDecimals;
    const balance = ethers.utils.formatUnits(rawBal, decimals);

    return { balance, srcToken, contract, token, rawBal };
  }, [address, data, isBtcToToken, wallet]);

  const updateDepositBalance = useCallback(async () => {
    try {
      const info = await depositInformation();
      if (!info) return;

      setDepositBalance({
        balance: info.balance,
        token: info.srcToken.symbol,
      });
    } catch (error) {
      logger.error(error);
      setDepositBalance({
        balance: '',
        token: '',
      });
    }
  }, [depositInformation]);

  useEffect(() => {
    updateDepositBalance();

    const interval = setInterval(() => {
      updateDepositBalance();
    }, 20000);

    return () => clearInterval(interval);
  }, [updateDepositBalance]);

  return useMemo(() => {
    return {
      depositBalance,
      handleWithdraw: async () => {
        const info = await depositInformation();
        if (!info) {
          throw Error('Something went wrong');
        }
        const { contract, rawBal, token } = info;

        if (!address || !wallet || !wallet.provider) {
          throw new Error('No wallet connected');
        }

        const contractAddress = onboardNetwork && getSkypoolsContractAddress(onboardNetwork);
        if (!contractAddress) {
          throw new Error('Contract address was not defined');
        }

        const web3 = new Web3(wallet.provider);
        const transaction: TransactionConfig = {
          nonce: await web3.eth.getTransactionCount(address),
          value: '0x0',
          from: address,
          to: contractAddress,
          data: contract.methods.redeemERC20Token(token, rawBal).encodeABI(),
        };

        const gasPrice = await web3.eth.getGasPrice();
        const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
        logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');

        return web3.eth
          .sendTransaction({ ...transaction, gasPrice, gas })
          .once('transactionHash', async (hash) => {
            return updateSwap({
              variables: {
                id: swapId,
                status: SwapStatus.Completed,
                skypoolsTransactionHash: hash,
              },
            });
          });
      },
    };
  }, [depositBalance, address, depositInformation, onboardNetwork, wallet, swapId, updateSwap]);
};
