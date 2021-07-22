import { ParaSwap } from 'paraswap';

import { shouldUseParaSwap } from '../env';
import { fetcher } from '../fetch';
import { Network, getNetworkId, getNetwork } from '../onboard';

import { ENDPOINT_1INCH_API } from './constants';
import { isParaSwapApiError } from './isParaSwapApiError';

export type ParaInchToken = {
  symbol: string;
  decimals: number;
  address: string;
  logoUri: string | null;
  network: Network;
};

export const getTokens = async ({ network }: { network: Network }): Promise<ParaInchToken[]> => {
  if (shouldUseParaSwap) {
    const paraSwap = new ParaSwap(getNetworkId(network));
    const tokens = await paraSwap.getTokens();
    if (isParaSwapApiError(tokens)) {
      throw new Error(`${tokens.status}: ${tokens.message}`);
    }

    return tokens
      .map(
        (it): ParaInchToken => ({
          symbol: it.symbol ?? '',
          decimals: +it.decimals,
          address: it.address,
          logoUri: (it.img === 'https://img.paraswap.network/token.png' ? null : it.img) || null,
          network: getNetwork(it.network)!,
        }),
      )
      .filter((it) => !!it.symbol && !!it.address);
  }

  const result = await fetcher<{
    tokens: Record<
      string,
      { symbol: string; name: string; decimals: number; address: string; logoURI: string }
    >;
  }>(`${ENDPOINT_1INCH_API}/${network}/tokens`);

  return Object.values(result.tokens).map(
    (it): ParaInchToken => ({
      symbol: it.symbol,
      decimals: +it.decimals,
      address: it.address,
      logoUri: it.logoURI || null,
      network,
    }),
  );
};
