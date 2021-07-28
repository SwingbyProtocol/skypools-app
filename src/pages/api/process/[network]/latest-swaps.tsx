import { StatusCodes } from 'http-status-codes';

import { getShallowSwaps, getSwapDetails } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/latest-swaps',
  fn: async ({ res, network, prisma, logger }) => {
    // const swaps = await Promise.all(
    //   (
    //     await getShallowSwaps({ network })
    //   ).map(async (it) => {
    //     const details = await getSwapDetails({ network, hash: it.hash });
    //     return { ...it, ...details };
    //   }),
    // );
    const swaps = await getShallowSwaps({ network });
    await prisma.$transaction(
      swaps.map((it) =>
        prisma.swapHistoric.upsert({ where: { id: it.id }, update: it, create: it }),
      ),
    );

    res.status(StatusCodes.OK).json({ swaps: swaps.length });
  },
});
