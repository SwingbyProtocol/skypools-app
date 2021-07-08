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

export type SwapQuoteRoute = {
  path: Array<SwapQuoteRouteStep[]>;
  toTokenAmount: Big;
  toTokenAmountUsd: Big;
  estimatedGas: Big | null;
  estimatedGasUsd: Big | null;
};

export type SwapQuote = {
  fromTokenAmount: Big;
  fromTokenPriceUsd: Big;
  fromTokenAmountUsd: Big;
  toTokenAmount: Big;
  toTokenPriceUsd: Big;
  toTokenAmountUsd: Big;
  estimatedGas: Big | null;
  estimatedGasUsd: Big | null;
  spender: string | null;
  routes: SwapQuoteRoute[];
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

type OneInchApiResult = {
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

    const transaction = await (async (): Promise<SwapQuote['transaction']> => {
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

    const routes = [
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
      },
      ...result.others.map(
        (it): SwapQuoteRoute => ({
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
          ...(() => {
            const estimatedGasUsd = (() => {
              try {
                return it.data?.gasUSD ? new Big(it.data?.gasUSD) : null;
              } catch (e) {
                return null;
              }
            })();

            return {
              estimatedGas: (() => {
                try {
                  return estimatedGasUsd?.times(nativeTokenPriceUsd) ?? null;
                } catch (e) {
                  return null;
                }
              })(),
              estimatedGasUsd,
            };
          })(),
          ...(() => {
            const toTokenAmount = (() => {
              try {
                if (!isAmountValid) return new Big(0);
                return new Big(it.rate).div(`1e${toToken.decimals}`);
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
        }),
      ),
    ];

    return {
      transaction,
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
      routes,
      estimatedGas: routes[0].estimatedGas,
      estimatedGasUsd: routes[0].estimatedGasUsd,
      toTokenAmount: routes[0].toTokenAmount,
      toTokenAmountUsd: routes[0].toTokenAmountUsd,
      spender: transaction?.to ?? null,
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

  const transaction = await (async (): Promise<SwapQuote['transaction']> => {
    if (!result.tx || !isAmountValid) return null;
    return { ...result.tx, chainId: network };
  })();

  return {
    transaction,
    spender: result.tx?.to || null,
    fromTokenPriceUsd,
    toTokenPriceUsd,
    estimatedGas,
    estimatedGasUsd,
    fromTokenAmount,
    fromTokenAmountUsd,
    toTokenAmount,
    toTokenAmountUsd,
    routes: result.protocols.map((it) => ({
      estimatedGas,
      toTokenAmountUsd,
      estimatedGasUsd,
      toTokenAmount,
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
