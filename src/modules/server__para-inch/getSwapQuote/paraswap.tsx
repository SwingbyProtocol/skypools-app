import { Prisma } from '@prisma/client';
import { ParaSwap } from 'paraswap';
import Web3 from 'web3';

import { getNetworkId } from '../../networks';
import { NATIVE_TOKEN_ADDRESS } from '../../para-inch';
import { isParaSwapApiError } from '../isParaSwapApiError';
import { getPriceUsd } from '../coin-details';
import { prisma } from '../../server__env';
import { buildWeb3Instance } from '../../server__web3';
import { logger } from '../../logger';

import type { GetSwapQuoteParams, SwapQuote } from './types';

export const getParaSwapSwapQuote = async ({
  beneficiaryAddress,
  destTokenAddress,
  initiatorAddress,
  network,
  srcTokenAddress,
  srcTokenAmount: srcTokenAmountParam,
}: GetSwapQuoteParams): Promise<SwapQuote> => {
  const { srcToken, destToken } = await (async () => {
    const web3 = new Web3();
    const srcToken = await prisma.token.findUnique({
      where: {
        network_address: { network, address: web3.utils.toChecksumAddress(srcTokenAddress) },
      },
    });
    if (!srcToken) {
      throw new Error(`Could not find token "${srcTokenAddress}" on network ${network}`);
    }

    const destToken = await prisma.token.findUnique({
      where: {
        network_address: { network, address: web3.utils.toChecksumAddress(destTokenAddress) },
      },
    });
    if (!destToken) {
      throw new Error(`Could not find token "${destTokenAddress}" on network ${network}`);
    }

    return { srcToken, destToken };
  })();

  const [nativeTokenPriceUsd, srcTokenPriceUsd, destTokenPriceUsd] = await Promise.all(
    [NATIVE_TOKEN_ADDRESS, srcTokenAddress, destTokenAddress].map((tokenAddress) =>
      getPriceUsd({ network, tokenAddress }),
    ),
  );

  const paraSwap = new ParaSwap(getNetworkId(network));
  const result = await paraSwap.getRate(
    srcTokenAddress,
    destTokenAddress,
    srcTokenAmountParam.times(`1e${srcToken.decimals}`).toFixed(0),
  );
  if (isParaSwapApiError(result)) {
    logger.error({ err: result }, 'Failed to get rate from ParaSwap');
    throw result;
  }

  if (!result.bestRouteGas || !result.bestRouteGasCostUSD) {
    throw new Error(`Did not get "bestRouteGas" or "bestRouteGasCostUSD" from ParaSwap`);
  }

  const srcTokenAmount = new Prisma.Decimal(result.srcAmount).div(`1e${srcToken.decimals}`);

  const spender = await (async () => {
    const result = await paraSwap.getSpender(buildWeb3Instance({ network }));
    if (typeof result !== 'string') {
      throw new Error(`Could not get spender address for network "${network}"`);
    }

    return result;
  })();

  const transaction = await (async (): Promise<SwapQuote['bestRoute']['transaction']> => {
    const tx = await paraSwap.buildTx(
      srcToken.address,
      destToken.address,
      result.srcAmount,
      result.destAmount,
      result,
      initiatorAddress,
      'skypools',
      beneficiaryAddress ?? initiatorAddress,
      { ignoreChecks: true, onlyParams: true },
    );

    if (isParaSwapApiError(tx)) {
      logger.error({ err: tx }, 'Failed to build ParaSwap transaction');
      throw tx;
    }

    return tx;
  })();

  const bestRoute: SwapQuote['bestRoute'] = {
    fractionOfBest: new Prisma.Decimal(1),
    transaction,
    spender,
    path: result.bestRoute.map((it): SwapQuote['bestRoute']['path'][number] => [
      {
        exchange: it.exchange,
        fraction: (() => {
          try {
            return new Prisma.Decimal(it.percent).div(100);
          } catch (e) {
            return new Prisma.Decimal(0);
          }
        })(),
        srcTokenAddress: it.data?.tokenFrom ?? srcTokenAddress,
        destTokenAddress: it.data?.tokenTo ?? destTokenAddress,
      },
    ]),
    estimatedGas: new Prisma.Decimal(result.bestRouteGas),
    estimatedGasUsd: new Prisma.Decimal(result.bestRouteGasCostUSD),
    ...(() => {
      const destTokenAmount = new Prisma.Decimal(result.destAmount).div(`1e${destToken.decimals}`);

      return {
        destTokenAmount,
        destTokenAmountUsd: new Prisma.Decimal(destTokenAmount).times(destTokenPriceUsd),
      };
    })(),
  };

  return {
    srcTokenPriceUsd,
    destTokenPriceUsd,
    srcTokenAmount,
    srcTokenAmountUsd: new Prisma.Decimal(srcTokenAmount).times(srcTokenPriceUsd),

    bestRoute,

    otherExchanges: result.others
      .map((it): SwapQuote['otherExchanges'][number] => {
        const estimatedGasUsd = new Prisma.Decimal(it.data?.gasUSD);
        const estimatedGas = estimatedGasUsd.times(nativeTokenPriceUsd);

        const destTokenAmount = new Prisma.Decimal(it.rate).div(`1e${destToken.decimals}`);
        const destTokenAmountUsd = new Prisma.Decimal(destTokenAmount).times(destTokenPriceUsd);

        return {
          exchange: it.exchange,
          fraction: new Prisma.Decimal(1),
          srcTokenAddress: it.data?.tokenFrom ?? srcToken.address,
          destTokenAddress: it.data?.tokenTo ?? destToken.address,
          estimatedGas,
          estimatedGasUsd,
          destTokenAmountUsd,
          destTokenAmount,
          fractionOfBest: destTokenAmountUsd.div(bestRoute.destTokenAmountUsd),
        };
      })
      .sort((a, b) => {
        try {
          const aValue = !a.fractionOfBest.eq(1)
            ? a.fractionOfBest
            : a.exchange === bestRoute.path[0]?.[0]?.exchange
            ? new Prisma.Decimal(Number.MAX_SAFE_INTEGER)
            : new Prisma.Decimal(Number.MAX_SAFE_INTEGER).sub(1);

          const bValue = !b.fractionOfBest.eq(1)
            ? b.fractionOfBest
            : b.exchange === bestRoute.path[0]?.[0]?.exchange
            ? new Prisma.Decimal(Number.MAX_SAFE_INTEGER)
            : new Prisma.Decimal(Number.MAX_SAFE_INTEGER).sub(1);

          return bValue.cmp(aValue) || a.exchange.localeCompare(b.exchange);
        } catch (e) {
          return 0;
        }
      }),
  };
};
