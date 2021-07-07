import { ParaSwap } from 'paraswap';

import { shouldUseParaSwap } from '../env';
import { fetcher } from '../fetch';

import { isParaSwapApiError } from './isParaSwapApiError';
import type { SupportedNetworkId } from './isSupportedNetwork';

export const getSpender = async ({ network }: { network: SupportedNetworkId }): Promise<string> => {
  if (shouldUseParaSwap) {
    const result = await new ParaSwap(network).getAdapters();
    if (isParaSwapApiError(result) || !result?.augustus.exchange) {
      throw result;
    }

    return result?.augustus.exchange;
  }

  return (
    await fetcher<{ address: string }>(`https://api.1inch.exchange/v3.0/${network}/approve/spender`)
  ).address;
};
