import { StatusCodes } from 'http-status-codes';
import { LockId } from '@prisma/client';

import { getShallowSwaps } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/older-swaps',
  fn: async ({ res, network, prisma, logger, lock }) => {
    await lock(LockId.OLDER_SWAPS);
    const endBlockNumber = (
      await prisma.swapHistoric.aggregate({ where: { network }, _min: { blockNumber: true } })
    )._min.blockNumber;
    if (!endBlockNumber) {
      res.status(StatusCodes.OK).json({ swaps: 0 });
      return;
    }

    const swaps = await getShallowSwaps({ network, endBlockNumber: endBlockNumber.toString() });
    for (const swap of swaps) {
      await prisma.swapHistoric.upsert({ where: { id: swap.id }, update: swap, create: swap });
    }

    logger.debug('Added %d swaps to DB', swaps.length);
    res.status(StatusCodes.OK).json({ swaps: swaps.length });
  },
});
