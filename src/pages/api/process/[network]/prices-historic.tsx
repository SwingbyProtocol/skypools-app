import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';

import { getPriceHistoryFromCoingecko } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/prices-historic',
  fn: async ({ res, network, prisma, logger }) => {
    const failed: typeof tokens = [];
    const tokens = await prisma.token.findMany({
      where: { network },
      orderBy: { priceHistoryUpdatedAt: 'asc' },
      take: 5,
    });

    const priceHistorics = await Promise.all(
      tokens.map(async (it) => {
        try {
          logger.debug({ token: it }, 'Will fetch price history');
          const priceHistoric = await getPriceHistoryFromCoingecko({
            network,
            tokenAddress: it.address,
          });
          logger.trace({ token: it, priceHistoric }, 'Got price history');

          return priceHistoric;
        } catch (err) {
          logger.error(
            { err, tokenAddress: it.address },
            'Failed to get price history from Coingecko',
          );
          return null;
        }
      }),
    );

    // We do this first to make sure that we rotate what tokens are processed each time.
    await prisma.token.updateMany({
      where: { id: { in: tokens.map((it) => it.id) } },
      data: { priceHistoryUpdatedAt: DateTime.utc().toJSDate() },
    });

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const priceHistoric = priceHistorics[i];
      if (!priceHistoric) {
        continue;
      }

      try {
        logger.debug({ token }, 'Will save price history to DB');
        await prisma.$transaction(
          priceHistoric.map((it) => {
            const tokenId = token.id;
            const at = it.at.toJSDate();

            return prisma.tokenUsdPriceHistoric.upsert({
              where: { tokenId_at: { tokenId, at } },
              create: {
                tokenId,
                at,
                price: new Prisma.Decimal(it.value.toFixed()),
              },
              update: {
                tokenId,
                at,
                price: new Prisma.Decimal(it.value.toFixed()),
              },
            });
          }),
        );

        logger.debug({ token }, 'Price history saved to DB');
      } catch (err) {
        logger.error({ err, token }, 'Crashed getting token price');
        failed.push(token);
      }
    }

    res.status(StatusCodes.OK).json({ tokenCount: tokens.length, failed: failed.length });
  },
});
