import { useContext } from 'react';
import { ParaSwap } from 'paraswap';

import { NetworkId } from '../onboard';
import { fetcher } from '../fetch';

import { ENDPOINT_1INCH_API, SHOULD_USE_PARASWAP } from './constants';
import { SupportedNetworkId } from './isSupportedNetwork';
import { isParaSwapApiError } from './isParaSwapApiError';

export type ParaInchToken = {
  symbol: string;
  decimals: number;
  address: string;
  logoUri: string | null;
  network: NetworkId;
};

export const getTokens = async ({
  network,
}: {
  network: SupportedNetworkId;
}): Promise<ParaInchToken[]> => {
  if (SHOULD_USE_PARASWAP) {
    const paraSwap = new ParaSwap(network);
    const tokens = await paraSwap.getTokens();
    if (isParaSwapApiError(tokens)) {
      throw new Error(`${tokens.status}: ${tokens.message}`);
    }

    return tokens
      .map(
        (it): ParaInchToken => ({
          symbol: it.symbol ?? '',
          decimals: it.decimals,
          address: it.address,
          logoUri: (it.img === 'https://img.paraswap.network/token.png' ? null : it.img) || null,
          network: it.network as NetworkId,
        }),
      )
      .filter((it) => !!it.symbol);
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
      decimals: it.decimals,
      address: it.address,
      logoUri: it.logoURI || null,
      network,
    }),
  );
};
