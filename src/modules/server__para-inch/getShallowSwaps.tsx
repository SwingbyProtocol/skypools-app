import { DateTime } from 'luxon';
import { stringifyUrl } from 'query-string';
import { Prisma, SwapHistoric, SwapStatus } from '@prisma/client';

import { Network } from '../networks';
import { fetcherEtherscan } from '../fetch';
import { logger as baseLogger } from '../logger';
import { getScanApiUrl } from '../web3';
import { buildWeb3Instance } from '../server__web3';

import { getSpender } from './getSpender';

type ApiResult = {
  result?: Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    to: string;
    from: string;
    value: string;
    confirmations: string;
    isError: string;
  }> | null;
};

const buildSwapId = ({ network, hash }: { network: Network; hash: string }) => {
  return Buffer.from(`${network}::${hash}`, 'utf-8').toString('base64');
};

export const getShallowSwaps = async ({
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
  const web3 = buildWeb3Instance({ network });
  const address = (await getSpender({ network })).toLowerCase();

  logger.debug({ address, startBlockNumber, endBlockNumber }, 'Will fetch swap list');

  const response =
    (
      await fetcherEtherscan<ApiResult>(
        stringifyUrl({
          url: getScanApiUrl({ network }),
          query: {
            module: 'account',
            action: 'txlist',
            address,
            sort: 'desc',
            startblock: startBlockNumber ?? undefined,
            endblock: endBlockNumber ?? undefined,
          },
        }),
      )
    ).result ?? [];

  return response
    .filter((it) => it.to.toLowerCase() === address)
    .map(
      (
        it,
      ): Omit<
        SwapHistoric,
        'createdAt' | 'updatedAt' | 'srcAmount' | 'srcTokenId' | 'destAmount' | 'destTokenId'
      > => {
        const hash = it.hash.toLowerCase();
        return {
          id: buildSwapId({ network, hash }),
          network,
          blockNumber: BigInt(it.blockNumber),
          at: DateTime.fromMillis(+it.timeStamp * 1000, { zone: 'utc' }).toJSDate(),
          hash,
          contractAddress: web3.utils.toChecksumAddress(`${it.to}`),
          initiatorAddress: web3.utils.toChecksumAddress(`${it.from}`),
          status: ((): SwapStatus => {
            try {
              return Number.parseInt(it.isError) !== 0
                ? SwapStatus.FAILED
                : new Prisma.Decimal(it.confirmations).gte(15)
                ? SwapStatus.CONFIRMED
                : SwapStatus.SENT;
            } catch (e) {
              return SwapStatus.SENT;
            }
          })(),
        };
      },
    );
};
