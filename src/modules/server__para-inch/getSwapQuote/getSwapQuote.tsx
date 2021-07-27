import { Big } from 'big.js';

import { shouldUseParaSwap } from '../../env';

import { getParaSwapSwapQuote } from './paraswap';
import { getOneInchSwapQuote } from './one-inch';
import type { GetSwapQuoteParams, SwapQuote } from './types';

export const getSwapQuote = async ({
  amount: amountParam,
  fromToken,
  toToken,
  slippageFraction: slippageFractionParam,
  network,
  walletProvider,
  sourceAddress,
}: GetSwapQuoteParams): Promise<SwapQuote> => {
  const isAmountValid = ((): boolean => {
    try {
      return new Big(amountParam).gt(0);
    } catch (e) {
      return false;
    }
  })();

  const amount = (() => {
    try {
      if (!isAmountValid) {
        throw new Error();
      }

      return new Big(amountParam ?? 1);
    } catch (e) {
      return new Big(1);
    }
  })().times(`1e${fromToken.decimals}`);

  const slippageFraction = (() => {
    try {
      return new Big(slippageFractionParam ?? '0.05');
    } catch (e) {
      return new Big('0.05');
    }
  })();

  if (shouldUseParaSwap) {
    return getParaSwapSwapQuote({
      amount,
      fromToken,
      toToken,
      isAmountValid,
      network,
      slippageFraction,
      sourceAddress,
      walletProvider,
    });
  }

  return getOneInchSwapQuote({
    amount,
    fromToken,
    toToken,
    isAmountValid,
    network,
    slippageFraction,
    sourceAddress,
    walletProvider,
  });
};
