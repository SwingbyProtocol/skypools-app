import { SwapLogHistoric } from '@prisma/client';

import { Network } from '../networks';
import { logger as baseLogger } from '../logger';
import { scanApiFetcher } from '../server__web3';

import { getSpender } from './getSpender';

type ApiResult = {
  result?: Array<{
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    logIndex: string;
    transactionHash: string;
    transactionIndex: string;
  }> | null;
};

type SwapLog = Omit<SwapLogHistoric, 'createdAt' | 'updatedAt'>;

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

export const getSwapLogs = async ({
  network,
  endBlockNumber,
  startBlockNumber,
  logger = baseLogger,
}: {
  network: Network;
  startBlockNumber?: number | string | null;
  endBlockNumber?: number | string | null;
  logger?: typeof baseLogger;
}) => {
  const address = (await getSpender({ network })).toLowerCase();
  logger.debug({ address, startBlockNumber, endBlockNumber }, 'Will fetch log list');

  const response =
    (
      await scanApiFetcher<ApiResult>({
        network,
        query: {
          module: 'logs',
          action: 'getLogs',
          address,
          sort: 'desc',
          startblock: startBlockNumber ?? undefined,
          endblock: endBlockNumber ?? undefined,
        },
      })
    ).result ?? [];

  return response.map((it): SwapLog => {
    const transactionHash = it.transactionHash.toLowerCase();
    const logIndex = it.logIndex === '0x' ? 0 : +BigInt(it.logIndex).toString();

    return {
      id: buildLogId({ network, transactionHash, logIndex }),
      blockNumber: BigInt(it.blockNumber),
      data: it.data,
      logIndex,
      network,
      topics: it.topics,
      transactionHash,
      transactionIndex: it.transactionIndex === '0x' ? 0 : +BigInt(it.transactionIndex).toString(),
    };
  });
};
