import { StatusCodes } from 'http-status-codes';

import { getTokens } from '../../../../modules/server__para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/tokens',
  fn: async ({ res, network, prisma, logger }) => {
    const tokens = await getTokens({ network });
    const failed: typeof tokens = [];
    for (let token of tokens) {
      try {
        await prisma.token.upsert({
          where: { network_address: { network, address: token.address } },
          create: {
            id: token.id,
            network,
            address: token.address,
            decimals: token.decimals,
            logoUri: token.logoUri ?? undefined,
            symbol: token.symbol,
          },
          update: {
            id: token.id,
            network,
            address: token.address,
            decimals: token.decimals,
            logoUri: token.logoUri ?? undefined,
            symbol: token.symbol,
          },
        });
      } catch (err) {
        logger.error({ err }, 'Failed to save token info to DB');
        tokens.push(token);
      }
    }

    res.status(StatusCodes.OK).json({ tokenCount: tokens.length, failed: failed.length });
  },
});
