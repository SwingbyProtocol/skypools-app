import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { getPriceHistory } from '../../../../modules/para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/tokens',
  fn: async ({ res, network, prisma, logger }) => {
    const tokens = await prisma.token.findMany({ where: { network } });
    const failed: typeof tokens = [];

    for (const token of tokens) {
      try {
        logger.debug({ token }, 'Will fetch price history');
        const priceHistoric = await getPriceHistory({ network, tokenAddress: token.address });
        logger.trace({ token, priceHistoric }, 'Got price history');

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
