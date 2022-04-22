import { Wallet } from 'bnc-onboard/dist/src/interfaces';

import { useWalletConnection } from '../../hooks/useWalletConnection';
import { useParaInchForm } from '../useParaInchForm';
import { ParaInchContextValue } from '../context';

import { useCreateSkyPoolsSwap } from './useCreateSkyPoolsSwap';
import { useCreateSwapAmongERC20S } from './useCreateSwapAmongERC20S';

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
  isSkyPools: boolean;
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
    isSkyPools,
    isFromBtc,
    onboardNetwork,
    parainchValue,
    walletCheck,
    wallet,
    address,
  });

  const erc20Swap = useCreateSwapAmongERC20S({
    isSkyPools,
    isFromBtc,
    onboardNetwork,
    parainchValue,
    walletCheck,
    wallet,
    address,
  });

  if (skypoolsSwap) {
    return {
      isSkyPools,
      isFloatShortage: skypoolsSwap.isFloatShortage,
      ...(skypoolsSwap as SwapReturn),
    };
  }

  return {
    isSkyPools,
    isFloatShortage: false,
    ...(erc20Swap as SwapReturn),
  };
};
