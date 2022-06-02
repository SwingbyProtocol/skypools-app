// eslint-disable-next-line import/no-unresolved
import { Wallet } from 'bnc-onboard/dist/src/interfaces';

import { useWalletConnection } from '../../hooks/useWalletConnection';
import { useParaInchForm } from '../useParaInchForm';
import { ParaInchContextValue } from '../context';

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
      ...skypoolsSwap,
      isLoading: skypoolsSwap.isLoading,
    };
  }

  return {
    isSkyPools,
    isFloatShortage: false,
    ...(erc20Swap as UseCreateSwapAmongERC20S),
    isLoading: erc20Swap?.isLoading || false,
  };
};
