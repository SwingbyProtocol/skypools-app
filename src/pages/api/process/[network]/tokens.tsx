import { StatusCodes } from 'http-status-codes';
import Web3 from 'web3';

import { getTokens, buildTokenId } from '../../../../modules/server__para-inch';
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

    if (network === 'ROPSTEN') {
      const web3 = new Web3();
      const wbtc = web3.utils.toChecksumAddress('0x442Be68395613bDCD19778e761f03261ec46C06D');
      await prisma.token.upsert({
        where: { network_address: { network, address: wbtc } },
        create: {
          id: buildTokenId({ network, tokenAddress: wbtc }),
          network,
          address: wbtc,
          decimals: 8,
          logoUri: 'https://img.paraswap.network/WBTC.png',
          symbol: 'WBTC',
        },
        update: {
          address: wbtc,
          decimals: 8,
          logoUri: 'https://img.paraswap.network/WBTC.png',
          symbol: 'WBTC',
        },
      });
    }

    res.status(StatusCodes.OK).json({ tokenCount: tokens.length, failed: failed.length });
  },
});
