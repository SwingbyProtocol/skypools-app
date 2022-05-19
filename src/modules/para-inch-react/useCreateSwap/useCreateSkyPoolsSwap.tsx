import { useCallback, useEffect, useMemo, useState } from 'react';
import Big from 'big.js';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';

import { simpleSwapPriceRoute, txDataSpSimpleSwap } from '../spSimpleSwap';
import { logger } from '../../logger';
import {
  buildSkypoolsContract,
  getERC20Address,
  getSkypoolsContractAddress,
  getWrappedBtcAddress,
  isFakeBtcToken,
} from '../../para-inch';
import { useSkypoolsFloats } from '../useSkypoolsFloats';
import { buildLinkToTransaction } from '../../server__web3';
import { skyPoolsSwapFeePercent } from '../../env';

import { SwapReturn, UseCreateSwapsProps } from './index';

export type UseCreateSwapReturnSkyPools = Omit<
  SwapReturn,
  'hasEnoughAllowance' | 'requestAllowance'
> & {
  isFloatShortage: boolean;
};

export const useCreateSkyPoolsSwap = ({
  onboardNetwork,
  isFromBtc,
  wallet,
  walletCheck,
  address,
  parainchValue,
}: UseCreateSwapsProps): UseCreateSwapReturnSkyPools | undefined => {
  const { floats } = useSkypoolsFloats();
  const { swapQuote, network, slippage, fromToken, amount, toToken, setAmount } = parainchValue;
  const [createSwapError, setCreateSwapError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFloatShortage, setIsFloatShortage] = useState<boolean>(false);
  const [btcAddress, setBtcAddress] = useState<string>('');
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [balance, setBalance] = useState<{ amount: string; token: string }>({
    amount: '',
    token: '',
  });
  const [minAmount, setMinAmount] = useState<{ amount: string; token: string }>({
    amount: '',
    token: '',
  });

  const contractAddress = getSkypoolsContractAddress(network);

  const getSimpleSwapData = useCallback(() => {
    if (!toToken || !fromToken || !address || !contractAddress || !swapQuote) return;
    const destTokenAddress = isFromBtc ? toToken.address : getWrappedBtcAddress(network);
    const srcTokenAddress = isFromBtc
      ? getWrappedBtcAddress(network)
      : getERC20Address({ network, tokenAddress: fromToken.address });

    return {
      userAddress: address,
      skypoolsAddress: contractAddress,
      network,
      isFromBtc,
      slippage,
      destDecimals: toToken.decimals,
      destTokenAddress,
      srcTokenAddress,
      srcDecimals: fromToken.decimals,
      srcAmount: new Big(swapQuote.srcTokenAmount).times(`1e${fromToken.decimals}`).toFixed(0),
    };
  }, [address, contractAddress, fromToken, isFromBtc, network, slippage, swapQuote, toToken]);

  const getBalance = useCallback(async () => {
    if (!address || !network || !fromToken) return;

    const contract = buildSkypoolsContract(network);
    const token = isFakeBtcToken(fromToken.address)
      ? getWrappedBtcAddress(network)
      : getERC20Address({ network, tokenAddress: fromToken.address });

    const rawBal = await contract.methods
      .balanceOf(token, address)
      .call()
      .catch((e: any) => {
        return '0';
      });
    const decimals = fromToken.decimals;
    const amount = ethers.utils.formatUnits(rawBal, decimals);

    setBalance({
      amount,
      token: fromToken.symbol,
    });

    if (!floats || !swapQuote || !toToken) return;
    const skybridgeFloat = isFromBtc ? floats.wrappedBtc : floats.btc;
    const spRequiredFloatAmount = isFromBtc ? amount : swapQuote.bestRoute.destTokenAmount;
    setIsFloatShortage(Number(spRequiredFloatAmount) > Number(skybridgeFloat));
    return;
  }, [address, network, fromToken, floats, isFromBtc, toToken, swapQuote]);

  const checkIsFloatEnough = useCallback(async () => {
    if (!floats || !swapQuote) return;
    const skybridgeFloat = isFromBtc ? floats.wrappedBtc : floats.btc;

    const spRequiredFloatAmount = isFromBtc ? amount : swapQuote.bestRoute.destTokenAmount;

    setIsFloatShortage(Number(spRequiredFloatAmount) > Number(skybridgeFloat));
  }, [floats, isFromBtc, swapQuote, amount]);

  const getMinimumAmount = useCallback(async () => {
    if (!toToken) return;
    try {
      const simpleSwapQuoteData = getSimpleSwapData();
      if (!simpleSwapQuoteData) return;
      const { minAmount } = await simpleSwapPriceRoute(simpleSwapQuoteData);
      const formattedMinAmount = ethers.utils.formatUnits(minAmount, toToken.decimals);
      const minAmountMinusFees = Number(formattedMinAmount) * (1 - skyPoolsSwapFeePercent / 100);

      setMinAmount({
        amount: String(minAmountMinusFees),
        token: toToken.symbol,
      });
    } catch (error) {
      logger.error(error);
      setMinAmount({
        amount: '',
        token: '',
      });
    }
  }, [toToken, getSimpleSwapData]);

  useEffect(() => {
    getBalance();
    checkIsFloatEnough();
    getMinimumAmount();

    const interval = setInterval(() => {
      getBalance();
      checkIsFloatEnough();
      getMinimumAmount();
    }, 10000);

    return () => clearInterval(interval);
  }, [getBalance, checkIsFloatEnough, getMinimumAmount]);

  useEffect(() => {
    setCreateSwapError('');
    setExplorerLink('');
  }, [fromToken, amount, toToken, onboardNetwork]);

  const toMaxAmount = useCallback(async () => {
    if (!balance.amount) return;
    setAmount(balance.amount);
    return;
  }, [setAmount, balance]);

  return useMemo(() => {
    return {
      isQuote: !!(amount && swapQuote),
      isEnoughDeposit: Number(balance.amount) >= Number(amount),
      balance,
      isLoading,
      isFloatShortage,
      createSwapError,
      minAmount,
      btcAddress,
      explorerLink,
      toMaxAmount,
      setBtcAddress,
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

        if (!contractAddress) {
          throw new Error('Contract address has not been defined');
        }

        if (!fromToken || !toToken) return;

        const skypoolsSwap = async () => {
          const web3 = new Web3(wallet.provider);
          const contract = buildSkypoolsContract(network);

          const simpleSwapQuoteData = getSimpleSwapData();
          if (!simpleSwapQuoteData) return;

          const arg = await txDataSpSimpleSwap(simpleSwapQuoteData);

          const transaction: TransactionConfig = {
            nonce: await web3.eth.getTransactionCount(address),
            value: '0x0',
            from: address,
            to: contractAddress,
            data: isFromBtc
              ? contract.methods.spFlow1SimpleSwap(arg).encodeABI()
              : contract.methods.spFlow2SimpleSwap(btcAddress, arg).encodeABI(),
          };

          const gasPrice = await web3.eth.getGasPrice();
          const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
          logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');

          const walletValidStatus = await walletCheck();
          if (!walletValidStatus) {
            throw Error('Invalid wallet connection');
          }
          return web3.eth
            .sendTransaction({ ...transaction, gasPrice, gas })
            .once('transactionHash', (transactionHash) => {
              const url = buildLinkToTransaction({ network, transactionHash });
              setExplorerLink(url);
            });
        };

        try {
          setIsLoading(true);
          return await skypoolsSwap();
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
    network,
    onboardNetwork,
    swapQuote,
    wallet,
    contractAddress,
    isFromBtc,
    isLoading,
    amount,
    btcAddress,
    fromToken,
    toToken,
    getSimpleSwapData,
    balance,
    isFloatShortage,
    minAmount,
    explorerLink,
    walletCheck,
    toMaxAmount,
  ]);
};
