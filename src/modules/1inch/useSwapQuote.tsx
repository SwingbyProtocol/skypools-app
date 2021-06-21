import { Duration } from 'luxon';
import { useEffect, useState } from 'react';
import { ParaSwap, OptimalRatesWithPartnerFees } from 'paraswap';
import { Big, BigSource } from 'big.js';
import { stringifyUrl } from 'query-string';

import { fetcher } from '../fetch';
import { logger } from '../logger';
import { useOnboard } from '../onboard';

import { ENDPOINT_1INCH_API, SHOULD_USE_PARASWAP } from './constants';
import { isSupportedNetworkId } from './isSupportedNetwork';
import { isParaSwapApiError } from './isParaSwapApiError';
import { Token, useTokens } from './useTokens';

const CHECK_EVERY_MS = Duration.fromObject({ minutes: 30 }).as('milliseconds');

type SwapQuoteRouteStep = {
  exchange: string;
  fraction: Big;
  fromToken: Pick<Token, 'address' | 'symbol' | 'logoUri'>;
  toToken: Pick<Token, 'address' | 'symbol' | 'logoUri'>;
};

export type SwapQuoteRoute = { path: Array<SwapQuoteRouteStep[]> };

type SwapQuote = {
  fromTokenAmount: Big;
  toTokenAmount: Big;
  estimatedGas: Big | null;
  routes: SwapQuoteRoute[];
};

export const useSwapQuote = ({
  fromTokenAddress,
  toTokenAddress,
  amount: amountParam,
}: {
  fromTokenAddress: string | null | undefined;
  toTokenAddress: string | null | undefined;
  amount: BigSource | null | undefined;
}) => {
  const { network: networkParam } = useOnboard();
  const { tokens } = useTokens();
  const [swapPath, setPath] = useState<SwapQuote | null>(null);

  const network = isSupportedNetworkId(networkParam) ? networkParam : 1;

  useEffect(() => {
    if (typeof fromTokenAddress !== 'string' || typeof toTokenAddress !== 'string') {
      return;
    }

    const amount = (() => {
      try {
        return new Big(amountParam ?? 0);
      } catch (e) {
        return new Big(0);
      }
    })();

    let cancelled = false;

    const check = async () => {
      if (cancelled) return;

      try {
        if (!SHOULD_USE_PARASWAP) {
          const result = await fetcher<{
            toTokenAmount: string;
            fromTokenAmount: string;
            protocols: Array<
              Array<
                Array<{
                  name: string;
                  part: number;
                  fromTokenAddress: string;
                  toTokenAddress: string;
                }>
              >
            >;
            estimatedGas: number;
          }>(
            stringifyUrl({
              url: `${ENDPOINT_1INCH_API}/${network}/quote`,
              query: {
                fromTokenAddress,
                toTokenAddress,
                amount: amount.toFixed(),
              },
            }),
          );

          if (cancelled) return;
          console.log({ ['1inchResult']: result });
          setPath({
            estimatedGas: (() => {
              try {
                return result.estimatedGas ? new Big(result.estimatedGas) : null;
              } catch (e) {
                return null;
              }
            })(),
            fromTokenAmount: (() => {
              try {
                return new Big(result.fromTokenAmount);
              } catch (e) {
                return Big(0);
              }
            })(),
            toTokenAmount: (() => {
              try {
                return new Big(result.toTokenAmount);
              } catch (e) {
                return Big(0);
              }
            })(),
            routes: result.protocols.map((it) => ({
              path: it.map((it) =>
                it.map(
                  (it): SwapQuoteRouteStep => ({
                    exchange: it.name,
                    fraction: (() => {
                      try {
                        return new Big(it.part).div(100);
                      } catch (e) {
                        return new Big(0);
                      }
                    })(),
                    fromToken: tokens.find(
                      ({ address }) => address.toLowerCase() === it.fromTokenAddress.toLowerCase(),
                    ) ?? { address: it.fromTokenAddress, symbol: '', logoUri: null },
                    toToken: tokens.find(
                      ({ address }) => address.toLowerCase() === it.toTokenAddress.toLowerCase(),
                    ) ?? { address: it.toTokenAddress, symbol: '', logoUri: null },
                  }),
                ),
              ),
            })),
          });
        } else {
          const paraSwap = new ParaSwap(network);
          const result = await paraSwap.getRate(fromTokenAddress, toTokenAddress, amount.toFixed());
          if (isParaSwapApiError(result)) {
            throw new Error(`${result.status}: ${result.message}`);
          }

          if (cancelled) return;
          console.log({ paraSwapResult: result });
          setPath({
            estimatedGas: (() => {
              try {
                return result.bestRouteGas ? new Big(result.bestRouteGas) : null;
              } catch (e) {
                return null;
              }
            })(),
            fromTokenAmount: (() => {
              try {
                return new Big(result.srcAmount);
              } catch (e) {
                return Big(0);
              }
            })(),
            toTokenAmount: (() => {
              try {
                return new Big(result.destAmount);
              } catch (e) {
                return Big(0);
              }
            })(),
            routes: [
              {
                path: result.bestRoute.map((it): SwapQuoteRouteStep[] => [
                  {
                    exchange: it.exchange,
                    fraction: (() => {
                      try {
                        return new Big(it.percent).div(100);
                      } catch (e) {
                        return new Big(0);
                      }
                    })(),
                    fromToken: tokens.find(
                      ({ address }) => address.toLowerCase() === it.data?.tokenFrom?.toLowerCase(),
                    ) ?? { address: it.data?.tokenFrom, symbol: '', logoUri: null },
                    toToken: tokens.find(
                      ({ address }) => address.toLowerCase() === it.data?.tokenTo?.toLowerCase(),
                    ) ?? { address: it.data?.tokenTo, symbol: '', logoUri: null },
                  },
                ]),
              },
              ...(result.multiRoute ?? []).map((route) => ({
                path: route.map((it): SwapQuoteRouteStep[] => [
                  {
                    exchange: it.exchange,
                    fraction: (() => {
                      try {
                        return new Big(it.percent).div(100);
                      } catch (e) {
                        return new Big(0);
                      }
                    })(),
                    fromToken: tokens.find(
                      ({ address }) => address.toLowerCase() === it.data?.tokenFrom?.toLowerCase(),
                    ) ?? { address: it.data?.tokenFrom, symbol: '', logoUri: null },
                    toToken: tokens.find(
                      ({ address }) => address.toLowerCase() === it.data?.tokenTo?.toLowerCase(),
                    ) ?? { address: it.data?.tokenTo, symbol: '', logoUri: null },
                  },
                ]),
              })),
            ],
          });
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
  }, [network, amountParam, fromTokenAddress, toTokenAddress]);

  return { swapPath };
};
