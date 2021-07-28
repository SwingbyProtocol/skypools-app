import { Big } from 'big.js';
import { stringifyUrl } from 'query-string';

import { fetcher } from '../../fetch';
import { getNetworkId } from '../../networks';
import { ENDPOINT_1INCH_API } from '../constants';
import { NATIVE_TOKEN_ADDRESS } from '../../para-inch';
import { getPriceUsd } from '../coin-details';

import type { InteralGetSwapQuoteParams, SwapQuote, SwapQuoteRouteStep } from './types';

export const getOneInchSwapQuote = async ({
  amount,
  isAmountValid,
  network,
  fromToken,
  toToken,
  slippageFraction,
  sourceAddress,
}: InteralGetSwapQuoteParams): Promise<SwapQuote> => {
  const [nativeTokenPriceUsd, fromTokenPriceUsd, toTokenPriceUsd] = await Promise.all(
    [NATIVE_TOKEN_ADDRESS, fromToken.address, toToken.address].map((tokenAddress) =>
      getPriceUsd({ network, tokenAddress }),
    ),
  );

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
        slippage: slippageFraction.toNumber(),
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
    return { ...result.tx, chainId: getNetworkId(network) };
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
