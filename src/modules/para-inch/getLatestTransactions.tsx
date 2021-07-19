import { DateTime } from 'luxon';
import { stringifyUrl } from 'query-string';
import { Big } from 'big.js';

import { fetcher } from '../fetch';
import { logger } from '../logger';
import { getScanApiUrl } from '../web3';
import { shouldUseParaSwap } from '../env';

import { SupportedNetworkId } from './isSupportedNetwork';

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

type DexHistoryResult = {
  hash: string;
  depositAddress: string;
  receivingAddress: string;
  currencyOut: string;
  amountOut: string;
  tokenLogoOut: string;
  currencyIn: string;
  amountIn: string;
  tokenLogoIn: string;
  method: string;
  type: string;
};

export const getLatestTransactions = async ({
  address: addressParam,
  network,
  spender: spenderParam,
}: {
  address: string;
  network: SupportedNetworkId;
  spender: string;
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

  const result = response
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

  const mergedResult = await Promise.all(
    result.map(async (it): Promise<HistoryItem> => {
      try {
        const { amountOut, amountIn, currencyIn, currencyOut } = await fetcher<DexHistoryResult>(
          stringifyUrl({
            url: 'https://skybridge-stats.vercel.app/api/v1/dex-swap-history',
            query: {
              dex: shouldUseParaSwap ? 'paraswap' : '1inch',
              network,
              hash: `${it.hash}`,
            },
          }),
        );

        return {
          ...it,
          fromAmount: (() => {
            try {
              return new Big(amountIn);
            } catch (e) {
              return null;
            }
          })(),
          toAmount: (() => {
            try {
              return new Big(amountOut);
            } catch (e) {
              return null;
            }
          })(),
          fromTokenAddress: currencyIn,
          toTokenAddress: currencyOut,
        };
      } catch (error) {
        return it;
      }
    }),
  );

  logger.debug({ address, spender, result, response, mergedResult }, 'Got latest transaction list');

  return mergedResult;
};
