import { StatusCodes } from 'http-status-codes';

import { getSwapDetails } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/swap-details',
  fn: async ({ res, network, prisma, logger }) => {
    const failed: typeof swaps = [];
    const swaps = await prisma.swapHistoric.findMany({
      where: {
        OR: [
          { srcTokenId: { equals: null } },
          { destTokenId: { equals: null } },
          { srcAmount: { equals: null } },
          { destAmount: { equals: null } },
          { srcAmount: { equals: 0 } },
          { destAmount: { equals: 0 } },
        ],
      },
      orderBy: { updatedAt: 'asc' },
      take: 100,
    });

    for (const swap of swaps) {
      try {
        const info = await getSwapDetails({ network, hash: swap.hash });
        logger.debug({ swapId: swap.id, info }, 'Failed saving swap details');
        await prisma.swapHistoric.update({ where: { id: swap.id }, data: info });
      } catch (err) {
        logger.error({ err, swapId: swap.id }, 'Failed saving swap details');
        failed.push(swap);
      }
    }

    res.status(StatusCodes.OK).json({ swaps: swaps.length, failed: failed.length });
  },
});
