import { DateTime } from 'luxon';
import { stringifyUrl } from 'query-string';
import { Big } from 'big.js';

import { fetcher } from '../fetch';
import { logger } from '../logger';
import { getScanApiUrl } from '../web3';

import { SupportedNetworkId } from './isSupportedNetwork';
import { getTransactionDetails } from './getTransactionDetails';

type HistoryItem = {
  hash: string;
  at: DateTime;
  blockNumber: string;
  from: string;
  to: string;
  status: 'pending' | 'sent' | 'confirmed' | 'failed';
  fromTokenAddress: string | null;
  toTokenAddress: string | null;
  fromAmount: Big | null;
  toAmount: Big | null;
};

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

export const getLatestTransactions = async ({
  address: addressParam,
  network,
  spender: spenderParam,
  walletProvider,
}: {
  address: string;
  network: SupportedNetworkId;
  spender: string;
  walletProvider: any;
}): Promise<HistoryItem[]> => {
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

  const withoutDetails = response
    .map(
      (it): HistoryItem => ({
        blockNumber: `${it.blockNumber}`,
        at: DateTime.fromMillis(+it.timeStamp * 1000, { zone: 'utc' }),
        hash: `${it.hash}`,
        from: `${it.from}`,
        to: `${it.to}`,
        status: ((): 'pending' | 'sent' | 'confirmed' | 'failed' => {
          try {
            return Number.parseInt(it.isError) !== 0
              ? 'failed'
              : new Big(it.confirmations).gte(15)
              ? 'confirmed'
              : 'sent';
          } catch (e) {
            return 'sent';
          }
        })(),
        fromAmount: null,
        toAmount: null,
        fromTokenAddress: null,
        toTokenAddress: null,
      }),
    )
    .filter((it) => it.to.toLowerCase() === spender && it.from.toLowerCase() === address);

  const result = !walletProvider
    ? withoutDetails
    : await Promise.all(
        withoutDetails.map(async (it) => {
          try {
            const { toTokenAddress, fromTokenAddress, toAmount, fromAmount } =
              await getTransactionDetails({
                hash: it.hash,
                network,
                walletProvider,
              });

            return { ...it, toTokenAddress, fromTokenAddress, toAmount, fromAmount };
          } catch (err) {
            logger.warn({ err }, 'Failed to get transaction details');
            return it;
          }
        }),
      );

  logger.debug({ address, spender, result, response }, 'Got latest transaction list');

  return result;
};
