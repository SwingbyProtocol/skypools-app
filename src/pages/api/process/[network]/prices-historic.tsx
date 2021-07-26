import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';

import { getPriceHistory } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/tokens',
  fn: async ({ res, network, prisma, logger }) => {
    const failed: typeof tokens = [];
    const tokens = await prisma.token.findMany({
      where: { network },
      orderBy: { priceHistoryUpdatedAt: 'asc' },
      take: 5,
    });

    const priceHistorics = await Promise.all(
      tokens.map(async (it) => {
        logger.debug({ token: it }, 'Will fetch price history');
        const priceHistoric = await getPriceHistory({ network, tokenAddress: it.address });
        logger.trace({ token: it, priceHistoric }, 'Got price history');

        return priceHistoric;
      }),
    );

    // We do this first to make sure that we rotate what tokens are processed each time.
    await prisma.token.updateMany({
      where: { network, address: { in: tokens.map((it) => it.address) } },
      data: { priceHistoryUpdatedAt: DateTime.utc().toJSDate() },
    });

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const priceHistoric = priceHistorics[i];

      try {
        logger.debug({ token }, 'Will save price history to DB');
        await prisma.$transaction(
          priceHistoric.map((it) => {
            const tokenAddress = token.address;
            const tokenNetwork = token.network;
            const at = it.at.toJSDate();

            return prisma.tokenUsdPriceHistoric.upsert({
              where: {
                tokenNetwork_tokenAddress_at: { tokenAddress, tokenNetwork, at },
              },
              create: {
                tokenAddress,
                tokenNetwork,
                at,
                price: new Prisma.Decimal(it.value.toFixed()),
              },
              update: {
                tokenAddress,
                tokenNetwork,
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
