import { ParaSwap } from 'paraswap';
import { Big, BigSource } from 'big.js';
import { stringifyUrl } from 'query-string';

import { fetcher } from '../fetch';

import { ENDPOINT_1INCH_API, SHOULD_USE_PARASWAP } from './constants';
import { SupportedNetworkId } from './isSupportedNetwork';
import { isParaSwapApiError } from './isParaSwapApiError';

type SwapQuoteRouteStep = {
  exchange: string;
  fraction: Big;
  fromTokenAddress: string;
  toTokenAddress: string;
};

export type SwapQuoteRoute = { path: Array<SwapQuoteRouteStep[]> };

export type SwapQuote = {
  fromTokenAmount: Big;
  toTokenAmount: Big;
  estimatedGas: Big | null;
  routes: SwapQuoteRoute[];
};

export const getSwapQuote = async ({
  amount: amountParam,
  network,
  fromTokenAddress,
  toTokenAddress,
}: {
  network: SupportedNetworkId;
  amount: BigSource;
  fromTokenAddress: string;
  toTokenAddress: string;
}): Promise<SwapQuote> => {
  const amount = (() => {
    try {
      return new Big(amountParam ?? 0);
    } catch (e) {
      return new Big(0);
    }
  })();

  if (SHOULD_USE_PARASWAP) {
    const paraSwap = new ParaSwap(network);
    const result = await paraSwap.getRate(fromTokenAddress, toTokenAddress, amount.toFixed());
    if (isParaSwapApiError(result)) {
      throw new Error(`${result.status}: ${result.message}`);
    }

    return {
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
              fromTokenAddress: it.data?.tokenFrom ?? fromTokenAddress,
              toTokenAddress: it.data?.tokenTo ?? toTokenAddress,
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
              fromTokenAddress: it.data?.tokenFrom,
              toTokenAddress: it.data?.tokenTo,
            },
          ]),
        })),
      ],
    };
  }

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

  return {
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
            fromTokenAddress: it.fromTokenAddress,
            toTokenAddress: it.toTokenAddress,
          }),
        ),
      ),
    })),
  };
};
