import { ParaSwap } from 'paraswap';

import { shouldUseParaSwap } from '../env';
import { fetcher } from '../fetch';
import { Network, getNetworkId } from '../networks';

import { isParaSwapApiError } from './isParaSwapApiError';

export const getSpender = async ({ network }: { network: Network }): Promise<string> => {
  if (shouldUseParaSwap) {
    const result = await new ParaSwap(getNetworkId(network)).getAdapters();
    if (isParaSwapApiError(result) || !result?.augustus.exchange) {
      throw result;
    }

    return result?.augustus.exchange;
  }

  return (
    await fetcher<{ address: string }>(
      `https://api.1inch.exchange/v3.0/${getNetworkId(network)}/approve/spender`,
    )
  ).address;
};
