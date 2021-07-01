import { ParaSwap } from 'paraswap';
import { Big, BigSource } from 'big.js';
import { stringifyUrl } from 'query-string';
import Web3 from 'web3';

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
  contractAddress: string | null;
  routes: SwapQuoteRoute[];
  transaction: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: string | number;
    gasPrice: string;
    chainId: number;
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
  const amount = (() => {
    try {
      return new Big(amountParam ?? 0).times(`1e${fromToken.decimals}`);
    } catch (e) {
      return new Big(0);
    }
  })();

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

    const contractAddress = await (async () => {
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

    const transaction = await (async (): Promise<SwapQuote['transaction']> => {
      if (!sourceAddress || !walletProvider) return null;

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
    })();

    return {
      transaction,
      contractAddress,
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

  const transaction = await (async (): Promise<SwapQuote['transaction']> => {
    if (!result.tx) return null;
    return { ...result.tx, chainId: network };
  })();

  return {
    transaction,
    contractAddress: result.tx?.to || null,
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
