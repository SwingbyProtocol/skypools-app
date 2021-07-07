import { DateTime } from 'luxon';
import { ParaSwap } from 'paraswap';
import { stringifyUrl } from 'query-string';
import { Big } from 'big.js';

import { fetcher } from '../fetch';
import { logger } from '../logger';
import { getScanApiUrl } from '../web3';

import { SupportedNetworkId } from './isSupportedNetwork';

type ApiResult = {
  result?: Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    to: string;
    from: string;
    value: string;
    confirmations: string;
  }> | null;
};

export const getLatestTransactions = async ({
  address: addressParam,
  network,
  spender: spenderParam,
}: {
  address: string;
  network: SupportedNetworkId;
  spender: string;
}) => {
  const address = addressParam.toLowerCase();
  const spender = spenderParam.toLowerCase();

  logger.debug({ address, spender }, 'Will fetch latest transaction list');

  const response =
    (
      await fetcher<ApiResult>(
        stringifyUrl({
          url: getScanApiUrl({ network }),
          query: {
            module: 'account',
            action: 'txlist',
            address,
            sort: 'desc',
          },
        }),
      )
    ).result ?? [];

  const result = response
    .map((it) => ({
      blockNumber: `${it.blockNumber}`,
      at: DateTime.fromMillis(+it.timeStamp * 1000, { zone: 'utc' }),
      hash: `${it.hash}`,
      from: `${it.from}`,
      to: `${it.to}`,
      status: ((): 'pending' | 'sent' | 'confirmed' => {
        try {
          return new Big(it.confirmations).gte(15) ? 'confirmed' : 'sent';
        } catch (e) {
          return 'sent';
        }
      })(),
    }))
    .filter((it) => it.to.toLowerCase() === spender && it.from.toLowerCase() === address);

  logger.debug({ address, spender, result, response }, 'Got latest transaction list');

  return result;
};
