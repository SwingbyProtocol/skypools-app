import { ParaSwap } from 'paraswap';

import { Network, getNetworkId } from '../networks';

import { isParaSwapApiError } from './isParaSwapApiError';

export const getSpender = async ({ network }: { network: Network }): Promise<string> => {
  const result = await new ParaSwap(getNetworkId(network)).getAdapters();
  if (isParaSwapApiError(result) || !result?.augustus.exchange) {
    throw result;
  }

  return result?.augustus.exchange;
};
