import { Duration } from 'luxon';
import { useEffect, useState } from 'react';

import { fetcher } from '../fetch';
import { logger } from '../logger';
import { useOnboard } from '../onboard';

import { ENDPOINT_1INCH_API } from './constants';

const CHECK_EVERY_MS = Duration.fromObject({ seconds: 10 }).as('milliseconds');

export const useHealthCheck = () => {
  const { network } = useOnboard();
  const [isHealthy, setHealthy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (cancelled) return;

      try {
        const result = await fetcher<{ status: string }>(
          `${ENDPOINT_1INCH_API}/${network}/healthcheck`,
        );

        if (cancelled) return;

        if (result.status !== 'OK') {
          throw new Error(`"status" is not "OK"`);
        }

        setHealthy(true);
      } catch (err) {
        logger.debug({ err }, 'Healthcheck failed');

        if (cancelled) return;
        setHealthy(false);
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

  return { isHealthy };
};
