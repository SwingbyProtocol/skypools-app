import { SwapStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';

import { getSwapDetails } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/swap-details',
  fn: async ({ res, network, prisma, logger }) => {
    const failed: typeof swaps = [];
    const swaps = await prisma.swapHistoric.findMany({
      where: {
        AND: [
          { status: { equals: SwapStatus.CONFIRMED } },
          {
            OR: [
              { srcTokenId: { equals: null } },
              { destTokenId: { equals: null } },
              { srcAmount: { equals: null } },
              { destAmount: { equals: null } },
              { srcAmount: { equals: 0 } },
              { destAmount: { equals: 0 } },
            ],
          },
        ],
      },
      orderBy: [{ detailsUpdatedAt: 'asc' }, { at: 'desc' }],
      take: 100,
      include: { logs: true },
    });

    // We do this first to make sure that we rotate what tokens are processed each time.
    await prisma.swapHistoric.updateMany({
      where: { id: { in: swaps.map((it) => it.id) } },
      data: { detailsUpdatedAt: DateTime.utc().toJSDate() },
    });

    for (const swap of swaps) {
      try {
        const info = await getSwapDetails({ network, hash: swap.hash, logger, logs: swap.logs });
        logger.debug({ swapId: swap.id, info }, 'Got swap details');
        await prisma.swapHistoric.update({
          where: { id: swap.id },
          data: {
            srcTokenId: info.srcTokenId || undefined,
            destTokenId: info.destTokenId || undefined,
            srcAmount: info.srcAmount ?? undefined,
            destAmount: info.destAmount ?? undefined,
          },
        });
      } catch (err) {
        logger.error({ err, swapId: swap.id }, 'Failed to save swap details to DB');
        failed.push(swap);
      }
    }

    logger.debug('Tried to add %d swaps to DB, %d failed', swaps.length, failed.length);
    res.status(StatusCodes.OK).json({ swaps: swaps.length, failed: failed.length });
  },
});
