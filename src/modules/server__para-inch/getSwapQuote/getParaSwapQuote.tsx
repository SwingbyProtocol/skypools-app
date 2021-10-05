import { Prisma } from '@prisma/client';
import { ParaSwap } from 'paraswap';
import Web3 from 'web3';

import { getNetworkId } from '../../networks';
import { isParaSwapApiError } from '../isParaSwapApiError';
import { prisma } from '../../server__env';
import { logger } from '../../logger';

import type { GetSwapQuoteParams, SwapQuote } from './types';

export const getParaSwapQuote = async ({
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

  if (!result.gasCost || !result.gasCostUSD) {
    throw new Error(`Did not get "gasCost" or "gasCostUSD" from ParaSwap`);
  }

  const spender = result.tokenTransferProxy;
  if (typeof spender !== 'string' || !spender) {
    throw new Error(`Could not get spender address for network "${network}"`);
  }

  const srcTokenAmount = new Prisma.Decimal(result.srcAmount).div(`1e${result.srcDecimals}`);
  const destTokenAmount = new Prisma.Decimal(result.destAmount).div(`1e${destToken.decimals}`);

  const srcTokenPriceUsd = new Prisma.Decimal(result.srcUSD).div(srcTokenAmount);
  const destTokenPriceUsd = new Prisma.Decimal(result.destUSD).div(destTokenAmount);
  const nativeTokenPriceUsd = new Prisma.Decimal(result.gasCostUSD).div(result.gasCost);

  const transaction = await (async (): Promise<SwapQuote['bestRoute']['transaction']> => {
    const tx = await paraSwap.buildTx(
      srcToken.address,
      destToken.address,
      result.srcAmount,
      result.destAmount,
      result,
      initiatorAddress,
      'skypools',
      undefined,
      undefined,
      beneficiaryAddress ?? initiatorAddress,
      { ignoreChecks: true },
    );

    if (isParaSwapApiError(tx)) {
      logger.error({ err: tx }, 'Failed to build ParaSwap transaction');
      throw tx;
    }

    return tx;
  })();

  const bestRoute: SwapQuote['bestRoute'] = {
    transaction,
    spender,
    path: await Promise.all(
      result.bestRoute.map(async (it): Promise<SwapQuote['bestRoute']['path'][number]> => {
        return {
          fraction: (() => {
            try {
              return new Prisma.Decimal(it.percent).div(100);
            } catch (e) {
              return new Prisma.Decimal(0);
            }
          })(),
          swaps: await Promise.all(
            it.swaps.map(
              async (swap): Promise<SwapQuote['bestRoute']['path'][number]['swaps'][number]> => {
                const web3 = new Web3();
                const srcTokenAddress = web3.utils.toChecksumAddress(swap.srcToken);
                const destTokenAddress = web3.utils.toChecksumAddress(swap.destToken);

                const srcToken = await prisma.token.findUnique({
                  where: { network_address: { network, address: srcTokenAddress } },
                });

                const destToken = await prisma.token.findUnique({
                  where: { network_address: { network, address: destTokenAddress } },
                });

                return {
                  srcTokenAddress,
                  destTokenAddress,
                  srcToken,
                  destToken,
                  exchanges: await Promise.all(
                    swap.swapExchanges.map(
                      async (
                        exchange,
                      ): Promise<
                        SwapQuote['bestRoute']['path'][number]['swaps'][number]['exchanges'][number]
                      > => {
                        return {
                          exchange: exchange.exchange,
                          fraction: (() => {
                            try {
                              return new Prisma.Decimal(exchange.percent).div(100);
                            } catch (e) {
                              return new Prisma.Decimal(0);
                            }
                          })(),
                          srcTokenAmount: new Prisma.Decimal(exchange.srcAmount).div(
                            `1e${swap.srcDecimals}`,
                          ),
                          destTokenAmount: new Prisma.Decimal(exchange.destAmount).div(
                            `1e${swap.destDecimals}`,
                          ),
                        };
                      },
                    ),
                  ),
                };
              },
            ),
          ),
        };
      }),
    ),
    estimatedGas: new Prisma.Decimal(result.gasCost),
    estimatedGasUsd: new Prisma.Decimal(result.gasCostUSD),
    destTokenAmount,
    destTokenAmountUsd: new Prisma.Decimal(result.destUSD),
  };

  const swapQuote = {
    srcToken,
    destToken,
    srcTokenPriceUsd,
    destTokenPriceUsd,
    nativeTokenPriceUsd,
    srcTokenAmount,
    srcTokenAmountUsd: new Prisma.Decimal(result.srcUSD),

    bestRoute,

    otherExchanges: (result.others ?? [])
      .map((it): SwapQuote['otherExchanges'][number] => {
        const estimatedGasUsd = new Prisma.Decimal(it.data?.gasUSD ?? 0);
        const estimatedGas = estimatedGasUsd.times(nativeTokenPriceUsd);

        const destTokenAmount = new Prisma.Decimal(it.destAmount).div(`1e${destToken.decimals}`);
        const destTokenAmountUsd = new Prisma.Decimal(destTokenAmount).times(destTokenPriceUsd);

        return {
          exchange: it.exchange,
          estimatedGas,
          estimatedGasUsd,
          destTokenAmountUsd,
          destTokenAmount,
          fractionOfBest: destTokenAmountUsd.div(bestRoute.destTokenAmountUsd),
        };
      })
      .sort((a, b) => {
        try {
          const aValue = a.fractionOfBest;
          const bValue = b.fractionOfBest;

          return bValue.cmp(aValue) || a.exchange.localeCompare(b.exchange);
        } catch (e) {
          return 0;
        }
      }),
  };

  logger.debug({ swapQuote }, 'Finished building swap quote object');
  return swapQuote;
};