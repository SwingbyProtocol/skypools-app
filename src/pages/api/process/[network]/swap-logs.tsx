import { LockId, SwapStatus } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { DateTime } from 'luxon';
import Web3 from 'web3';

import { createEndpoint } from '../../../../modules/server__api-endpoint';
import { buildWeb3Instance } from '../../../../modules/server__web3';
import { Network } from '../../../../modules/networks';

const buildLogId = ({
  network,
  transactionHash,
  logIndex,
}: {
  network: Network;
  transactionHash: string;
  logIndex: number;
}) => {
  return Buffer.from(`${network}::${transactionHash.toLowerCase()}::${logIndex}`, 'utf-8').toString(
    'base64',
  );
};

export default createEndpoint({
  isSecret: true,
  logId: 'process/swap-logs',
  fn: async ({ res, network, prisma, logger, lock }) => {
    await lock(LockId.SWAP_LOGS);
    const web3 = (() => {
      if (network === Network.ETHEREUM) {
        return new Web3(
          new Web3.providers.HttpProvider('http://btc-eth-indexer.swingby.network:8545'),
        );
      }

      return buildWeb3Instance({ network });
    })();

    const failed: typeof swaps = [];
    const swaps = await prisma.swapHistoric.findMany({
      where: {
        logsUpdatedAt: { equals: null },
        status: { equals: SwapStatus.CONFIRMED },
      },
      orderBy: { at: 'desc' },
      take: 1000,
    });

    for (const swap of swaps) {
      try {
        const receipt = await web3.eth.getTransactionReceipt(swap.hash);
        if (!receipt) {
          throw new Error(`No receipt found for "${swap.hash}"`);
        }

        await prisma.$transaction([
          prisma.swapHistoric.update({
            where: { id: swap.id },
            data: { logsUpdatedAt: DateTime.utc().toJSDate() },
          }),
          ...receipt.logs.map((it) =>
            prisma.swapLogHistoric.create({
              data: {
                id: buildLogId({
                  network,
                  logIndex: it.logIndex,
                  transactionHash: it.transactionHash,
                }),
                network,
                transactionHash: it.transactionHash,
                transactionIndex: it.transactionIndex,
                logIndex: it.logIndex,
                address: web3.utils.toChecksumAddress(it.address),
                data: it.data,
                topics: it.topics,
                blockNumber: it.blockNumber,
                blockHash: it.blockHash,
              },
            }),
          ),
        ]);

        logger.debug({ swapId: swap.id, logs: receipt.logs }, 'Got swap logs');
      } catch (err) {
        if (/request count exceeded/i.test(err.message)) {
          logger.error('Infura request limit exceeded');
          throw err;
        }

        logger.error({ err, swapId: swap.id }, 'Failed to save swap logs to DB');
        failed.push(swap);
      }
    }

    logger.debug('Tried to add %d swap logs to DB, %d failed', swaps.length, failed.length);
    res.status(StatusCodes.OK).json({ swaps: swaps.length, failed: failed.length });
  },
});
