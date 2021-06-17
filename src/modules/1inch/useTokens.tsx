import { Duration } from 'luxon';
import { useEffect, useState } from 'react';

import { fetcher } from '../fetch';
import { logger } from '../logger';
import { NetworkId, useOnboard } from '../onboard';

import { ENDPOINT_1INCH_API } from './constants';

const CHECK_EVERY_MS = Duration.fromObject({ minutes: 1 }).as('milliseconds');

type Token = {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoUri: string;
  network: NetworkId;
};

export const useTokens = () => {
  const { network: networkParam } = useOnboard();
  const [tokens, setTokens] = useState<Token[]>([]);

  const network = networkParam ?? 1;

  useEffect(() => {
    setTokens([]);
  }, [network]);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (cancelled) return;

      try {
        const result = await fetcher<{
          tokens: Record<
            string,
            { symbol: string; name: string; decimals: number; address: string; logoURI: string }
          >;
        }>(`${ENDPOINT_1INCH_API}/${network}/tokens`);

        if (cancelled) return;
        setTokens(
          Object.values(result.tokens).map((it) => ({
            symbol: it.symbol,
            name: it.name,
            decimals: it.decimals,
            address: it.address,
            logoUri: it.logoURI,
            network,
          })),
        );
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
