import { Duration } from 'luxon';
import { useEffect, useState } from 'react';
import { ParaSwap } from 'paraswap';

import { fetcher } from '../fetch';
import { logger } from '../logger';
import { NetworkId, useOnboard } from '../onboard';

import { ENDPOINT_1INCH_API, SHOULD_USE_PARASWAP } from './constants';
import { isSupportedNetworkId } from './isSupportedNetwork';

const CHECK_EVERY_MS = Duration.fromObject({ minutes: 30 }).as('milliseconds');

type Token = {
  symbol: string;
  decimals: number;
  address: string;
  logoUri: string | null;
  network: NetworkId;
};

export const useTokens = () => {
  const { network: networkParam } = useOnboard();
  const [tokens, setTokens] = useState<Token[]>([]);

  const network = isSupportedNetworkId(networkParam) ? networkParam : 1;

  useEffect(() => {
    setTokens([]);
  }, [network]);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (cancelled) return;

      try {
        if (!SHOULD_USE_PARASWAP) {
          const result = await fetcher<{
            tokens: Record<
              string,
              { symbol: string; name: string; decimals: number; address: string; logoURI: string }
            >;
          }>(`${ENDPOINT_1INCH_API}/${network}/tokens`);

          if (cancelled) return;
          setTokens(
            Object.values(result.tokens).map(
              (it): Token => ({
                symbol: it.symbol,
                decimals: it.decimals,
                address: it.address,
                logoUri: it.logoURI || null,
                network,
              }),
            ),
          );
        } else {
          const paraSwap = new ParaSwap(network);
          const tokens = await paraSwap.getTokens();
          if (!Array.isArray(tokens)) {
            throw new Error(`${tokens.status}: ${tokens.message}`);
          }

          if (cancelled) return;
          setTokens(
            tokens
              .map(
                (it): Token => ({
                  symbol: it.symbol ?? '',
                  decimals: it.decimals,
                  address: it.address,
                  logoUri: it.img ?? null,
                  network: it.network as NetworkId,
                }),
              )
              .filter((it) => !!it.symbol),
          );
        }
      } catch (err) {
        logger.debug({ err }, 'Failed to fetch tokens');
      } finally {
        if (cancelled) return;
        setTimeout(check, CHECK_EVERY_MS);
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [network]);

  return { tokens };
};
