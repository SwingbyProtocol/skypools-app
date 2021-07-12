import { ParaSwap } from 'paraswap';
import { Big, BigSource } from 'big.js';
import { stringifyUrl } from 'query-string';
import Web3 from 'web3';
import type { TransactionConfig } from 'web3-eth';

import { fetcher } from '../fetch';
import { shouldUseParaSwap } from '../env';
import { logger } from '../logger';

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

type OtherSwapQuoteRoute = {
  path: Array<SwapQuoteRouteStep[]>;
  toTokenAmount: Big;
  toTokenAmountUsd: Big;
  estimatedGas: Big | null;
  estimatedGasUsd: Big | null;
  spender: null;
  transaction: null;
  fractionOfBest: Big;
};

type BestSwapQuoteRoute = Omit<OtherSwapQuoteRoute, 'spender' | 'transaction'> & {
  spender: string | null;
  transaction: {
    from: NonNullable<TransactionConfig['from']>;
    to: NonNullable<TransactionConfig['to']>;
    data: NonNullable<TransactionConfig['data']>;
    value: NonNullable<TransactionConfig['value']>;
    gas: NonNullable<TransactionConfig['gas']>;
    gasPrice: NonNullable<TransactionConfig['gasPrice']>;
    chainId: NonNullable<TransactionConfig['chainId']>;
  } | null;
};

export type SwapQuoteRoute = OtherSwapQuoteRoute | BestSwapQuoteRoute;

export type SwapQuote = {
  fromTokenPriceUsd: Big;
  toTokenPriceUsd: Big;

  fromTokenAmount: Big;
  fromTokenAmountUsd: Big;

  bestRoute: BestSwapQuoteRoute;
  otherRoutes: OtherSwapQuoteRoute[];
};

export const getSwapQuote = async ({
  amount: amountParam,
  network,
  fromToken,
  toToken,
  slippageFraction,
  sourceAddress,
  walletProvider,
}: {
  network: SupportedNetworkId;
  amount: BigSource;
  fromToken: ParaInchToken;
  toToken: ParaInchToken;
  slippageFraction?: BigSource | null;
  sourceAddress?: string | null;
  walletProvider?: any | null;
}): Promise<SwapQuote> => {
  const isAmountValid = ((): boolean => {
    try {
      return new Big(amountParam).gt(0);
    } catch (e) {
      return false;
    }
  })();

  const amount = (() => {
    try {
      if (!isAmountValid) {
        throw new Error();
      }

      return new Big(amountParam ?? 1);
    } catch (e) {
      return new Big(1);
    }
  })().times(`1e${fromToken.decimals}`);

  const slippage = (() => {
    try {
      return new Big(slippageFraction ?? '0.05');
    } catch (e) {
      return new Big('0.05');
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
      throw result;
    }

    const fromTokenAmount = (() => {
      try {
        if (!isAmountValid) return new Big(0);
        return new Big(result.srcAmount).div(`1e${fromToken.decimals}`);
      } catch (e) {
        return Big(0);
      }
    })();

    const spender = await (async () => {
      try {
        if (!walletProvider) return null;

        const result = await paraSwap.getSpender(new Web3(walletProvider));
        if (typeof result === 'string') {
          return result;
        }

        return null;
      } catch (err) {
        logger.warn({ err }, 'Failed to get ParaSwap spender address');
        return null;
      }
    })();

    const transaction = await (async (): Promise<SwapQuote['bestRoute']['transaction']> => {
      try {
        if (!sourceAddress || !walletProvider || !isAmountValid) return null;

        const tx = await paraSwap.buildTx(
          fromToken.address,
          toToken.address,
          result.srcAmount,
          result.destAmount,
          result,
          sourceAddress,
          'skypools',
          undefined,
        );

        if (isParaSwapApiError(tx)) {
          throw tx;
        }

        const web3 = new Web3(walletProvider);
        const gasPrice = await web3.eth.getGasPrice();

        const gas = await web3.eth.estimateGas({ ...tx, gasPrice });

        return { ...tx, gasPrice, gas };
      } catch (err) {
        logger.error({ err }, 'Could not build swap transaction');
        return null;
      }
    })();

    const bestRoute = {
      fractionOfBest: new Big(1),
      transaction,
      spender,
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
      ...(() => {
        const toTokenAmount = (() => {
          try {
            if (!isAmountValid) return new Big(0);
            return new Big(result.destAmount).div(`1e${toToken.decimals}`);
          } catch (e) {
            return Big(0);
          }
        })();

        return {
          toTokenAmount,
          toTokenAmountUsd: (() => {
            try {
              return new Big(toTokenAmount).times(toTokenPriceUsd);
            } catch (e) {
              return Big(0);
            }
          })(),
        };
      })(),
    };

    return {
      fromTokenPriceUsd,
      toTokenPriceUsd,
      fromTokenAmount,
      fromTokenAmountUsd: (() => {
        try {
          return new Big(fromTokenAmount).times(fromTokenPriceUsd);
        } catch (e) {
          return Big(0);
        }
      })(),

      bestRoute,

      otherRoutes: result.others
        .map((it): OtherSwapQuoteRoute => {
          const estimatedGasUsd = (() => {
            try {
              return it.data?.gasUSD ? new Big(it.data?.gasUSD) : null;
            } catch (e) {
              return null;
            }
          })();

          const estimatedGas = (() => {
            try {
              return estimatedGasUsd?.times(nativeTokenPriceUsd) ?? null;
            } catch (e) {
              return null;
            }
          })();

          const toTokenAmount = (() => {
            try {
              if (!isAmountValid) return new Big(0);
              return new Big(it.rate).div(`1e${toToken.decimals}`);
            } catch (e) {
              return Big(0);
            }
          })();

          const toTokenAmountUsd = (() => {
            try {
              return new Big(toTokenAmount).times(toTokenPriceUsd);
            } catch (e) {
              return Big(0);
            }
          })();

          return {
            spender: null,
            transaction: null,
            path: [
              [
                ((): SwapQuoteRouteStep => ({
                  exchange: it.exchange,
                  fraction: new Big(100),
                  fromTokenAddress: it.data?.tokenFrom ?? fromToken.address,
                  toTokenAddress: it.data?.tokenTo ?? fromToken.address,
                }))(),
              ],
            ],
            estimatedGas,
            estimatedGasUsd,
            toTokenAmountUsd,
            toTokenAmount,
            fractionOfBest: toTokenAmountUsd.div(bestRoute.toTokenAmountUsd),
          };
        })
        .sort((a, b) => {
          try {
            const aValue = !a.fractionOfBest.eq(1)
              ? a.fractionOfBest
              : a.path[0]?.[0]?.exchange === bestRoute.path[0]?.[0]?.exchange
              ? new Big(Number.MAX_SAFE_INTEGER)
              : new Big(Number.MAX_SAFE_INTEGER).sub(1);

            const bValue = !b.fractionOfBest.eq(1)
              ? b.fractionOfBest
              : b.path[0]?.[0]?.exchange === bestRoute.path[0]?.[0]?.exchange
              ? new Big(Number.MAX_SAFE_INTEGER)
              : new Big(Number.MAX_SAFE_INTEGER).sub(1);

            return bValue.cmp(aValue) || a.path[0][0].exchange.localeCompare(b.path[0][0].exchange);
          } catch (e) {
            return 0;
          }
        }),
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
    tx?: {
      from: string;
      to: string;
      data: string;
      value: string;
      gasPrice: string;
      gas: number;
    };
  }>(
    stringifyUrl({
      url: `${ENDPOINT_1INCH_API}/${network}/${sourceAddress ? 'swap' : 'quote'}`,
      query: {
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        amount: amount.toFixed(),
        fromAddress: sourceAddress || undefined,
        slippage: slippage.toNumber(),
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

  const estimatedGasUsd = (() => {
    if (estimatedGas === null) {
      return null;
    }

    try {
      return new Big(estimatedGas).times(nativeTokenPriceUsd);
    } catch (e) {
      return Big(0);
    }
  })();

  const fromTokenAmount = (() => {
    try {
      if (!isAmountValid) return new Big(0);
      return new Big(result.fromTokenAmount).div(`1e${fromToken.decimals}`);
    } catch (e) {
      return Big(0);
    }
  })();

  const fromTokenAmountUsd = (() => {
    try {
      return new Big(fromTokenAmount).times(fromTokenPriceUsd);
    } catch (e) {
      return Big(0);
    }
  })();

  const toTokenAmount = (() => {
    try {
      if (!isAmountValid) return new Big(0);
      return new Big(result.toTokenAmount).div(`1e${toToken.decimals}`);
    } catch (e) {
      return Big(0);
    }
  })();

  const toTokenAmountUsd = (() => {
    try {
      return new Big(toTokenAmount).times(toTokenPriceUsd);
    } catch (e) {
      return Big(0);
    }
  })();

  const transaction = await (async (): Promise<SwapQuote['bestRoute']['transaction']> => {
    if (!result.tx || !isAmountValid) return null;
    return { ...result.tx, chainId: network };
  })();

  return {
    fromTokenPriceUsd,
    toTokenPriceUsd,
    fromTokenAmount,
    fromTokenAmountUsd,
    otherRoutes: [],
    bestRoute: {
      fractionOfBest: new Big(1),
      spender: result.tx?.to || null,
      transaction,
      estimatedGas,
      toTokenAmountUsd,
      estimatedGasUsd,
      toTokenAmount,
      path: result.protocols[0].map((it) =>
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
    },
  };
};
