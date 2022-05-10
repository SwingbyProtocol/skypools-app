import { Wallet } from 'bnc-onboard/dist/src/interfaces';
import { useEffect, useState } from 'react';
import Web3 from 'web3';

import { useWalletConnection } from '../../hooks/useWalletConnection';
import { useParaInchForm } from '../useParaInchForm';
import { ParaInchContextValue } from '../context';
import { checkTokenAllowance, increaseAllowance } from '../../web3';

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

  useEffect(() => {
    if (!wallet || !parainchValue.swapQuote || !address) {
      return;
    }

    // @todo (agustin) check if peridocally using intervals
    const verifyAllowance = async () => {
      const web3 = new Web3(wallet.provider);
      const { swapQuote } = parainchValue;

      if (!swapQuote) {
        return;
      }

      const enoughAllowance = await checkTokenAllowance(
        swapQuote.srcToken.address,
        swapQuote.bestRoute.spender,
        address,
        web3,
      );
      setHasEnoughAllowance(enoughAllowance);
    };
    verifyAllowance();
  }, [wallet, parainchValue, address]);

  const requestAllowance = async () => {
    console.log('Requesting allowance..');
    const { swapQuote } = parainchValue;
    if (!swapQuote || !wallet || !address) {
      return;
    }

    const web3 = new Web3(wallet.provider);

    await increaseAllowance(swapQuote.srcToken.address, swapQuote.bestRoute.spender, address, web3);
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
    };
  }

  return {
    isSkyPools,
    isFloatShortage: false,
    hasEnoughAllowance,
    requestAllowance,
    ...(erc20Swap as UseCreateSwapAmongERC20S),
  };
};
