import { StatusCodes } from 'http-status-codes';

import { getSwapLogs } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/older-logs',
  fn: async ({ res, network, prisma, logger }) => {
    const endBlockNumber = (
      await prisma.swapLogHistoric.aggregate({ where: { network }, _min: { blockNumber: true } })
    )._min.blockNumber;
    if (!endBlockNumber) {
      res.status(StatusCodes.OK).json({ swaps: 0 });
      return;
    }

    const logs = await getSwapLogs({ network, logger, endBlockNumber: endBlockNumber.toString() });
    await prisma.$transaction(
      logs.map((it) =>
        prisma.swapLogHistoric.upsert({ where: { id: it.id }, update: it, create: it }),
      ),
    );

    logger.debug('Added %d logs to DB', logs.length);
    res.status(StatusCodes.OK).json({ swaps: logs.length });
  },
});
