import { StatusCodes } from 'http-status-codes';

import { getShallowSwaps } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/older-swaps',
  fn: async ({ res, network, prisma, logger }) => {
    const endBlockNumber = (
      await prisma.swapHistoric.aggregate({ where: { network }, _min: { blockNumber: true } })
    )._min.blockNumber;
    if (!endBlockNumber) {
      res.status(StatusCodes.OK).json({ swaps: 0 });
      return;
    }

    const swaps = await getShallowSwaps({ network, endBlockNumber: endBlockNumber.toString() });
    await prisma.$transaction(
      swaps.map((it) =>
        prisma.swapHistoric.upsert({ where: { id: it.id }, update: it, create: it }),
      ),
    );

    res.status(StatusCodes.OK).json({ swaps: swaps.length });
  },
});
