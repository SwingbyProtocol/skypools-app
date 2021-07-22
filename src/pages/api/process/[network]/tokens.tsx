import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import Web3 from 'web3';

import { getTokens } from '../../../../modules/para-inch';
import { createEndpoint } from '../../../../modules/server__api-endpoint';

export default createEndpoint({
  isSecret: true,
  logId: 'process/tokens',
  fn: async ({ res, network, prisma, logger }) => {
    const web3 = new Web3();

    const latestUpdate = (
      await prisma.token.aggregate({ where: { network }, _max: { updatedAt: true } })
    )._max.updatedAt;
    if (latestUpdate) {
      const keepDateGte = DateTime.fromJSDate(latestUpdate).minus({ days: 2 }).toJSDate();
      logger.debug(
        { latestUpdate, keepDateGte },
        'Will delete tokens that have not been updated in a while',
      );

      const result = await prisma.token.deleteMany({
        where: {
          network,
          updatedAt: { lt: keepDateGte },
        },
      });

      logger.info(
        { latestUpdate, keepDateGte },
        'Deleted %d tokens that had not been updated recently',
        result.count,
      );
    }

    const tokens = await getTokens({ network });
    const failed: typeof tokens = [];
    for (let token of tokens) {
      try {
        const address = web3.utils.toChecksumAddress(token.address);
        await prisma.token.upsert({
          where: { network_address: { network, address } },
          create: {
            network,
            address,
            decimals: token.decimals,
            logoUri: token.logoUri,
            symbol: token.symbol,
          },
          update: {
            network,
            address,
            decimals: token.decimals,
            logoUri: token.logoUri,
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
