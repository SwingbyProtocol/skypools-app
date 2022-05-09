import { useCallback, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';
import ABI from 'human-standard-token-abi';
import { ethers } from 'ethers';
import { TransactionConfig } from 'web3-eth';

import { buildParaTxData, isFakeNativeToken } from '../../para-inch';
import { buildLinkToTransaction } from '../../web3';
import { logger } from '../../logger';

import { getMinimumAmount } from './utils';

import { SwapReturn, UseCreateSwapsProps } from './index';

export const useCreateSwapAmongERC20S = ({
  onboardNetwork,
  isFromBtc,
  wallet,
  walletCheck,
  address,
  parainchValue,
}: UseCreateSwapsProps): SwapReturn | undefined => {
  const { swapQuote, network, slippage, fromToken, amount, toToken, setAmount } = parainchValue;
  const [createSwapError, setCreateSwapError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
  const contractAddress = swapQuote?.bestRoute.spender;

  const getWalletBalance = useCallback(async () => {
    if (!toToken || !fromToken || !address || !wallet) {
      return;
    }

    const web3 = new Web3(wallet.provider);
    if (isFakeNativeToken(fromToken.address)) {
      return web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');
    }

    const contract = new web3.eth.Contract(ABI, fromToken.address);
    const rawBalance = await contract.methods.balanceOf(address).call();
    return ethers.utils.formatUnits(rawBalance, fromToken.decimals);
  }, [address, fromToken, toToken, wallet]);

  const getBalance = useCallback(async () => {
    if (!fromToken) {
      return;
    }
    const amount = (await getWalletBalance()) ?? '0';
    setBalance({
      amount,
      token: fromToken.symbol,
    });
    return;
  }, [fromToken, getWalletBalance]);

  const updateMinimumAmount = useCallback(async () => {
    if (!contractAddress || !address) {
      return;
    }
    const minimumAmount = await getMinimumAmount({
      address,
      network,
      fromToken,
      toToken,
      swapQuote,
      contractAddress,
      isFromBtc,
      slippage,
    });
    setMinAmount(minimumAmount);
  }, [address, network, fromToken, toToken, swapQuote, contractAddress, isFromBtc, slippage]);

  useEffect(() => {
    getBalance();
    updateMinimumAmount();

    const interval = setInterval(() => {
      getBalance();
      updateMinimumAmount();
    }, 10000);

    return () => clearInterval(interval);
  }, [getBalance, updateMinimumAmount]);

  useEffect(() => {
    setCreateSwapError('');
    setExplorerLink('');
  }, [fromToken, amount, toToken, onboardNetwork]);

  const toMaxAmount = useCallback(async () => {
    const maxBalance = (await getWalletBalance()) ?? '0';
    setAmount(maxBalance);
  }, [setAmount, getWalletBalance]);

  return useMemo(() => {
    return {
      isQuote: !!(amount && swapQuote),
      isEnoughDeposit: Number(balance.amount) >= Number(amount),
      balance,
      isLoading,
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

        const erc20Swap = async () => {
          const web3 = new Web3(wallet.provider);
          const transaction: TransactionConfig = await buildParaTxData({
            priceRoute: JSON.parse(swapQuote.rawRouteData),
            slippage,
            userAddress: address,
          });

          const walletValidStatus = await walletCheck();
          if (!walletValidStatus) {
            throw Error('Invalid wallet connection');
          }
          return web3.eth
            .sendTransaction(transaction)
            .once('transactionHash', (transactionHash) => {
              const url = buildLinkToTransaction({ network, transactionHash });
              setExplorerLink(url);
            });
        };

        try {
          setIsLoading(true);
          return await erc20Swap();
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
    isLoading,
    amount,
    btcAddress,
    fromToken,
    toToken,
    balance,
    minAmount,
    explorerLink,
    walletCheck,
    toMaxAmount,
  ]);
};
