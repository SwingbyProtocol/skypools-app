import Big from 'big.js';
import { ethers } from 'ethers';
import ABI from 'human-standard-token-abi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';

import { logger } from '../logger';
import { useOnboard } from '../onboard';
import {
  buildParaTxData,
  buildSkypoolsContract,
  getERC20Address,
  getSkypoolsContractAddress,
  getWrappedBtcAddress,
  isFakeBtcToken,
  isFakeNativeToken,
} from '../para-inch';
import { buildLinkToTransaction } from '../web3';

import { simpleSwapPriceRoute, SimpleSwapQuote, txDataSpSimpleSwap } from './spSimpleSwap';
import { useParaInchForm } from './useParaInchForm';
import { useSkypoolsFloats } from './useSkypoolsFloats';

export const useCreateSwap = () => {
  const { address, wallet, onboard, network: onboardNetwork } = useOnboard();
  const { swapQuote, network, slippage, fromToken, amount, toToken, setAmount } = useParaInchForm();

  const { floats } = useSkypoolsFloats();
  const [createSwapError, setCreateSwapError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFloatShortage, setIsFloatShortage] = useState<boolean>(false);
  const [btcAddress, setBtcAddress] = useState<string>('');
  const [explorerLink, setExplorerLink] = useState<string>('');
  const [balance, setBalance] = useState<{ amount: string; token: string }>({
    amount: '',
    token: '',
  });
  const [minAmount, setMiniAmount] = useState<{ amount: string; token: string }>({
    amount: '',
    token: '',
  });

  const isFromBtc = fromToken?.symbol === 'BTC';
  const isToBtc = toToken?.symbol === 'BTC';
  const isSkypools = isToBtc || isFromBtc;

  const contractAddress = isSkypools
    ? getSkypoolsContractAddress(network)
    : swapQuote?.bestRoute.spender;

  const getSimpleSwapData = useCallback(() => {
    if (!toToken || !fromToken || !address || !contractAddress || !swapQuote) return;
    const destTokenAddress = isFromBtc ? toToken.address : getWrappedBtcAddress(network);
    const srcTokenAddress = isFromBtc
      ? getWrappedBtcAddress(network)
      : getERC20Address({ network, tokenAddress: fromToken.address });

    const simpleSwapQuoteData: SimpleSwapQuote = {
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
    return simpleSwapQuoteData;
  }, [address, contractAddress, fromToken, isFromBtc, network, slippage, swapQuote, toToken]);

  const walletCheck = useCallback(async () => {
    if (!onboard) {
      throw Error('Cannot detect onboard');
    }

    const result = await onboard?.walletCheck();
    if (!result) {
      throw Error('Invalid wallet connection');
    }
  }, [onboard]);

  const getWalletBalance = useCallback(async () => {
    if (!wallet || !fromToken || !address) return;
    const web3 = new Web3(wallet.provider);
    if (isFakeNativeToken(fromToken.address)) {
      return web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');
    }

    const contract = new web3.eth.Contract(ABI, fromToken.address);
    const rawBalance = await contract.methods.balanceOf(address).call();
    return ethers.utils.formatUnits(rawBalance, fromToken.decimals);
  }, [address, fromToken, wallet]);

  const getBalance = useCallback(async () => {
    if (!wallet || !address || !network || !fromToken) return;

    if (!isSkypools) {
      const amount = (await getWalletBalance()) ?? '0';
      setBalance({
        amount,
        token: fromToken.symbol,
      });
      return;
    } else {
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
    }
  }, [
    address,
    wallet,
    network,
    fromToken,
    floats,
    isFromBtc,
    isSkypools,
    toToken,
    swapQuote,
    getWalletBalance,
  ]);

  const checkIsFloatEnough = useCallback(async () => {
    if (!floats || !swapQuote || !isSkypools || !toToken) return;
    const skybridgeFloat = isFromBtc ? floats.wrappedBtc : floats.btc;

    const spRequiredFloatAmount = isFromBtc ? amount : swapQuote.bestRoute.destTokenAmount;

    setIsFloatShortage(Number(spRequiredFloatAmount) > Number(skybridgeFloat));
  }, [floats, isFromBtc, isSkypools, toToken, swapQuote, amount]);

  const getMinimumAmount = useCallback(async () => {
    if (!swapQuote || !address || !contractAddress || !fromToken || !toToken) return;
    try {
      const simpleSwapQuoteData = getSimpleSwapData();
      if (!simpleSwapQuoteData) return;
      const { minAmount } = await simpleSwapPriceRoute(simpleSwapQuoteData);

      setMiniAmount({
        amount: ethers.utils.formatUnits(minAmount, toToken.decimals),
        token: toToken.symbol,
      });
    } catch (error) {
      logger.error(error);
      setMiniAmount({
        amount: '',
        token: '',
      });
    }
  }, [toToken, swapQuote, address, contractAddress, fromToken, getSimpleSwapData]);

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
    if (isSkypools) {
      if (!balance.amount) return;
      setAmount(balance.amount);
    } else {
      const balance = (await getWalletBalance()) ?? '0';
      setAmount(balance);
    }
  }, [setAmount, balance, isSkypools, getWalletBalance]);

  return useMemo(() => {
    return {
      isQuote: !!(amount && swapQuote),
      isEnoughDeposit: Number(balance.amount) >= Number(amount),
      balance,
      isSkypools,
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

        try {
          setIsLoading(true);
          if (isSkypools) {
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
            logger.debug(
              { transaction: { ...transaction, gas, gasPrice } },
              'Will send transaction',
            );

            await walletCheck();
            return web3.eth
              .sendTransaction({ ...transaction, gasPrice, gas })
              .once('transactionHash', (transactionHash) => {
                const url = buildLinkToTransaction({ network, transactionHash });
                setExplorerLink(url);
              });
          } else {
            const web3 = new Web3(wallet.provider);
            const transaction: TransactionConfig = await buildParaTxData({
              priceRoute: JSON.parse(swapQuote.rawRouteData),
              slippage,
              userAddress: address,
            });

            await walletCheck();
            return web3.eth
              .sendTransaction(transaction)
              .once('transactionHash', (transactionHash) => {
                const url = buildLinkToTransaction({ network, transactionHash });
                setExplorerLink(url);
              });
          }
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
    slippage,
    contractAddress,
    isFromBtc,
    isLoading,
    amount,
    btcAddress,
    isSkypools,
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
