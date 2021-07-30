import { shouldUseParaSwap } from '../../env';

import { getParaSwapSwapQuote } from './paraswap';
import { getOneInchSwapQuote } from './one-inch';
import type { GetSwapQuoteParams, SwapQuote } from './types';

export const getSwapQuote = async (params: GetSwapQuoteParams): Promise<SwapQuote> => {
  if (shouldUseParaSwap) {
    return getParaSwapSwapQuote(params);
  }

  return getOneInchSwapQuote(params);
};
