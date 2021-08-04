import { StatusCodes } from 'http-status-codes';

import { getSwapLogs } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/newer-logs',
  fn: async ({ res, network, prisma, logger }) => {
    const startBlockNumber = (
      await prisma.swapLogHistoric.aggregate({ where: { network }, _max: { blockNumber: true } })
    )._max.blockNumber?.toString();

    const logs = await getSwapLogs({ network, logger, startBlockNumber });
    await prisma.$transaction(
      logs.map((it) =>
        prisma.swapLogHistoric.upsert({ where: { id: it.id }, update: it, create: it }),
      ),
    );

    logger.debug('Added %d logs to DB', logs.length);
    res.status(StatusCodes.OK).json({ logs: logs.length });
  },
});
