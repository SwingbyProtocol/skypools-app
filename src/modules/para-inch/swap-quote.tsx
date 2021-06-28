import { ParaSwap } from 'paraswap';
import { Big, BigSource } from 'big.js';
import { stringifyUrl } from 'query-string';

import { fetcher } from '../fetch';
import { shouldUseParaSwap } from '../env';

import { ENDPOINT_1INCH_API } from './constants';
import { SupportedNetworkId } from './isSupportedNetwork';
import { isParaSwapApiError } from './isParaSwapApiError';
import { ParaInchToken } from './tokens';
import { getPriceUsd } from './prices';
import { NATIVE_TOKEN_ADDRESS } from './isNativeToken';

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
  fromTokenPriceUsd: Big;
  toTokenPriceUsd: Big;
  fromTokenAmountUsd: Big;
  toTokenAmountUsd: Big;
  estimatedGas: Big | null;
  estimatedGasUsd: Big | null;
  routes: SwapQuoteRoute[];
};

export const getSwapQuote = async ({
  amount: amountParam,
  network,
  fromToken,
  toToken,
}: {
  network: SupportedNetworkId;
  amount: BigSource;
  fromToken: ParaInchToken;
  toToken: ParaInchToken;
}): Promise<SwapQuote> => {
  const amount = (() => {
    try {
      return new Big(amountParam ?? 0).times(`1e${fromToken.decimals}`);
    } catch (e) {
      return new Big(0);
    }
  })();

  const [nativeTokenPriceUsd, fromTokenPriceUsd, toTokenPriceUsd] = await Promise.all(
    [NATIVE_TOKEN_ADDRESS, fromToken.address, toToken.address].map((tokenAddress) =>
      getPriceUsd({ network, tokenAddress }),
    ),
  );

  if (shouldUseParaSwap) {
    const paraSwap = new ParaSwap(network);
    const result = await paraSwap.getRate(fromToken.address, toToken.address, amount.toFixed());
    if (isParaSwapApiError(result)) {
      throw new Error(`${result.status}: ${result.message}`);
    }

    const fromTokenAmount = (() => {
      try {
        return new Big(result.srcAmount).div(`1e${fromToken.decimals}`);
      } catch (e) {
        return Big(0);
      }
    })();

    const toTokenAmount = (() => {
      try {
        return new Big(result.destAmount).div(`1e${toToken.decimals}`);
      } catch (e) {
        return Big(0);
      }
    })();

    return {
      fromTokenPriceUsd,
      toTokenPriceUsd,
      estimatedGas: (() => {
        try {
          return result.bestRouteGas ? new Big(result.bestRouteGas) : null;
        } catch (e) {
          return null;
        }
      })(),
      estimatedGasUsd: (() => {
        try {
          return result.bestRouteGasCostUSD ? new Big(result.bestRouteGasCostUSD) : null;
        } catch (e) {
          return null;
        }
      })(),
      fromTokenAmount,
      fromTokenAmountUsd: (() => {
        try {
          return new Big(fromTokenAmount).times(fromTokenPriceUsd);
        } catch (e) {
          return Big(0);
        }
      })(),
      toTokenAmount,
      toTokenAmountUsd: (() => {
        try {
          return new Big(toTokenAmount).times(toTokenPriceUsd);
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
              fromTokenAddress: it.data?.tokenFrom ?? fromToken.address,
              toTokenAddress: it.data?.tokenTo ?? toToken.address,
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
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amount.toFixed(),
      },
    }),
  );

  const estimatedGas = (() => {
    try {
      return result.estimatedGas ? new Big(result.estimatedGas) : null;
    } catch (e) {
      return null;
    }
  })();

  const fromTokenAmount = (() => {
    try {
      return new Big(result.fromTokenAmount).div(`1e${fromToken.decimals}`);
    } catch (e) {
      return Big(0);
    }
  })();

  const toTokenAmount = (() => {
    try {
      return new Big(result.toTokenAmount).div(`1e${toToken.decimals}`);
    } catch (e) {
      return Big(0);
    }
  })();

  return {
    fromTokenPriceUsd,
    toTokenPriceUsd,
    estimatedGas,
    estimatedGasUsd: (() => {
      if (estimatedGas === null) {
        return null;
      }

      try {
        return new Big(estimatedGas).times(nativeTokenPriceUsd);
      } catch (e) {
        return Big(0);
      }
    })(),
    fromTokenAmount,
    fromTokenAmountUsd: (() => {
      try {
        return new Big(fromTokenAmount).times(fromTokenPriceUsd);
      } catch (e) {
        return Big(0);
      }
    })(),
    toTokenAmount,
    toTokenAmountUsd: (() => {
      try {
        return new Big(toTokenAmount).times(toTokenPriceUsd);
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
