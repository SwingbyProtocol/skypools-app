import { Big } from 'big.js';
import { ParaSwap } from 'paraswap';
import Web3 from 'web3';

import { logger } from '../../logger';
import { getNetworkId } from '../../onboard';
import { NATIVE_TOKEN_ADDRESS } from '../isNativeToken';
import { isParaSwapApiError } from '../isParaSwapApiError';
import { getPriceUsd } from '../prices';

import type {
  InteralGetSwapQuoteParams,
  OtherSwapQuoteRoute,
  SwapQuote,
  SwapQuoteRouteStep,
} from './types';

export const getParaSwapSwapQuote = async ({
  amount,
  isAmountValid,
  network,
  fromToken,
  toToken,
  slippageFraction,
  sourceAddress,
  walletProvider,
}: InteralGetSwapQuoteParams): Promise<SwapQuote> => {
  const [nativeTokenPriceUsd, fromTokenPriceUsd, toTokenPriceUsd] = await Promise.all(
    [NATIVE_TOKEN_ADDRESS, fromToken.address, toToken.address].map((tokenAddress) =>
      getPriceUsd({ network, tokenAddress }),
    ),
  );

  const paraSwap = new ParaSwap(getNetworkId(network));
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
};
