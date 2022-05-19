import { Wallet } from 'bnc-onboard/dist/src/interfaces';
import { useEffect, useState } from 'react';
import Web3 from 'web3';

import { useWalletConnection } from '../../hooks/useWalletConnection';
import { useParaInchForm } from '../useParaInchForm';
import { ParaInchContextValue } from '../context';
import { checkTokenAllowance, increaseAllowance } from '../../server__web3';

import { useCreateSkyPoolsSwap } from './useCreateSkyPoolsSwap';
import { UseCreateSwapAmongERC20S, useCreateSwapAmongERC20S } from './useCreateSwapAmongERC20S';

export type SwapReturn = {
  btcAddress: string;
  setBtcAddress: (address: string) => void;
  createSwap: () => void;
  toMaxAmount: () => void;
  balance: { amount: string; token: string };
  isLoading: boolean;
  isQuote: boolean;
  createSwapError: string;
  minAmount: { amount: string; token: string };
  isEnoughDeposit: boolean;
  explorerLink: string;
  hasEnoughAllowance: boolean;
  requestAllowance: () => void;
};

export type UseCreateSwapsProps = {
  isFromBtc: boolean;
  address: string | null;
  wallet: Wallet | null;
  walletCheck: () => Promise<boolean>;
  onboardNetwork: 'ETHEREUM' | 'ROPSTEN' | null;
  parainchValue: ParaInchContextValue;
};

export const useCreateSwap = (): SwapReturn & { isSkyPools: boolean; isFloatShortage: boolean } => {
  const { address, wallet, walletCheck, network: onboardNetwork } = useWalletConnection();
  const parainchValue = useParaInchForm();
  const isFromBtc = parainchValue.fromToken?.symbol === 'BTC';
  const isToBtc = parainchValue.toToken?.symbol === 'BTC';
  const isSkyPools = isToBtc || isFromBtc;
  const [hasEnoughAllowance, setHasEnoughAllowance] = useState<boolean>(false);
  const [loadingAllowance, setLoadingAllowance] = useState<boolean>(false);

  useEffect(() => {
    if (!wallet || !parainchValue.swapQuote || !address || loadingAllowance) {
      return;
    }

    const verifyAllowance = async () => {
      const web3 = new Web3(wallet.provider);
      const { swapQuote } = parainchValue;

      if (!swapQuote || !parainchValue.fromToken?.decimals) {
        return;
      }

      const minAllowance =
        Math.pow(10, parainchValue.fromToken?.decimals) * Number(swapQuote.srcTokenAmount);

      const enoughAllowance = await checkTokenAllowance(
        swapQuote.srcToken.address,
        swapQuote.bestRoute.spender,
        address,
        minAllowance,
        web3,
      );
      setHasEnoughAllowance(enoughAllowance);
    };
    verifyAllowance();
  }, [wallet, parainchValue, address, loadingAllowance]);

  const requestAllowance = async () => {
    console.log('Requesting allowance..');
    const { swapQuote } = parainchValue;
    if (!swapQuote || !wallet || !address || !parainchValue.fromToken) {
      return;
    }

    const web3 = new Web3(wallet.provider);

    const minAllowance =
      Math.pow(10, parainchValue.fromToken?.decimals) * Number(swapQuote.srcTokenAmount);
    setLoadingAllowance(true);
    try {
      await increaseAllowance(
        swapQuote.srcToken.address,
        swapQuote.bestRoute.spender,
        address,
        minAllowance,
        web3,
      );
    } catch (error) {
      console.error('Error increasing allowance...', error);
    } finally {
      setLoadingAllowance(false);
    }
  };

  const skypoolsSwap = useCreateSkyPoolsSwap({
    isFromBtc,
    onboardNetwork,
    parainchValue,
    walletCheck,
    wallet,
    address,
  });

  const erc20Swap = useCreateSwapAmongERC20S({
    isFromBtc,
    onboardNetwork,
    parainchValue,
    walletCheck,
    wallet,
    address,
  });

  if (isSkyPools && skypoolsSwap) {
    return {
      isSkyPools,
      hasEnoughAllowance,
      requestAllowance,
      ...skypoolsSwap,
      isLoading: skypoolsSwap.isLoading || loadingAllowance,
    };
  }

  return {
    isSkyPools,
    isFloatShortage: false,
    hasEnoughAllowance,
    requestAllowance,
    ...(erc20Swap as UseCreateSwapAmongERC20S),
    isLoading: erc20Swap?.isLoading || loadingAllowance,
  };
};
