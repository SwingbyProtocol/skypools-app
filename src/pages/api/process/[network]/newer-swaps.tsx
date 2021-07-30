import { StatusCodes } from 'http-status-codes';

import { getShallowSwaps } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/newer-swaps',
  fn: async ({ res, network, prisma, logger }) => {
    const startBlockNumber = (
      await prisma.swapHistoric.aggregate({ where: { network }, _max: { blockNumber: true } })
    )._max.blockNumber?.toString();

    const swaps = await getShallowSwaps({ network, startBlockNumber });
    await prisma.$transaction(
      swaps.map((it) =>
        prisma.swapHistoric.upsert({ where: { id: it.id }, update: it, create: it }),
      ),
    );

    res.status(StatusCodes.OK).json({ swaps: swaps.length });
  },
});
