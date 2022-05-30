import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';

import { createEndpoint } from '../../../../modules/server__api-endpoint';
import { getTokenLogoFromCoingecko } from '../../../../modules/server__para-inch';

export default createEndpoint({
  isSecret: true,
  logId: 'process/token-logos',
  fn: async ({ res, network, prisma, logger }) => {
    const failed: typeof tokens = [];
    const tokens =
      (await prisma?.token.findMany({
        where: {
          AND: [
            { network },
            {
              OR: [
                { logoUri: { equals: null } },
                { logoUri: { contains: 'coingecko', mode: 'insensitive' } },
              ],
            },
          ],
        },
        orderBy: { logoUpdatedAt: 'asc' },
        take: 5,
      })) || [];

    for (let token of tokens) {
      try {
        await prisma?.token.update({
          where: { id: token.id },
          data: {
            logoUri: await getTokenLogoFromCoingecko({ network, tokenAddress: token.address }),
            logoUpdatedAt: DateTime.utc().toJSDate(),
          },
        });
      } catch (err) {
        logger.error({ err }, 'Failed to save token logo to DB');
        tokens.push(token);
      }
    }

    res.status(StatusCodes.OK).json({ tokenCount: tokens.length, failed: failed.length });
  },
});
