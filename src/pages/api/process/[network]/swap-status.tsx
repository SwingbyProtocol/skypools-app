import { LockId, Prisma, SwapStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { createEndpoint } from '../../../../modules/server__api-endpoint';
import { buildWeb3Instance } from '../../../../modules/server__web3';

export default createEndpoint({
  isSecret: true,
  logId: 'process/swap-status',
  fn: async ({ res, network, prisma, logger, lock }) => {
    await lock(LockId.SWAP_STATUS);
    const failed: typeof swaps = [];
    const swaps = await prisma.swapHistoric.findMany({
      where: {
        status: { notIn: [SwapStatus.CONFIRMED, SwapStatus.FAILED] },
      },
      orderBy: [{ updatedAt: 'asc' }, { at: 'desc' }],
      take: 100,
    });

    const web3 = buildWeb3Instance({ network });
    const blockNumber = await web3.eth.getBlockNumber();

    for (const swap of swaps) {
      try {
        const receipt = await web3.eth.getTransactionReceipt(swap.hash);
        if (!receipt) continue;

        await prisma.swapHistoric.update({
          where: { id: swap.id },
          data: {
            status: !receipt.status
              ? SwapStatus.FAILED
              : new Prisma.Decimal(blockNumber).minus(receipt.blockNumber).gte(15)
              ? SwapStatus.CONFIRMED
              : SwapStatus.SENT,
          },
        });
      } catch (err) {
        logger.error({ err, swapId: swap.id }, 'Failed to update swap status to DB');
        failed.push(swap);
      }
    }

    logger.debug(
      'Tried to update status of %d swaps to DB, %d failed',
      swaps.length,
      failed.length,
    );
    res.status(StatusCodes.OK).json({ swaps: swaps.length, failed: failed.length });
  },
});
