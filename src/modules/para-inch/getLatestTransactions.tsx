import { DateTime } from 'luxon';
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

// Ref: https://developers.paraswap.network/smartcontracts
const paraSwapSpender = [
  '0x1bd435f3c054b6e901b7b108a0ab7617c808677b',
  '0x55a0e3b6579972055faa983482aceb4b251dcf15',
];

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
      status: ((): 'pending' | 'sent' | 'confirmed' | 'failed' => {
        try {
          const isFailedTx = Number(it.isError) > 0;
          return isFailedTx ? 'failed' : new Big(it.confirmations).gte(15) ? 'confirmed' : 'sent';
        } catch (e) {
          return 'sent';
        }
      })(),
    }))
    .filter((it) => it.to.toLowerCase() === spender && it.from.toLowerCase() === address);

  const mergedResult = await Promise.all(
    result.map(async (it) => {
      const base = 'https://skybridge-stats.vercel.app/api/v1/dex-swap-history';
      const dex = paraSwapSpender.includes(spender) ? 'paraswap' : '1inch';

      const url = stringifyUrl({
        url: base,
        query: {
          dex,
          network,
          hash: `${it.hash}`,
        },
      });
      try {
        const { amountOut, amountIn, tokenLogoOut, tokenLogoIn } = await fetcher<DexHistoryResult>(
          url,
        );
        return { ...it, amountOut, amountIn, tokenLogoOut, tokenLogoIn };
      } catch (error) {
        return {
          ...it,
          amountOut: '0',
          amountIn: '0',
          tokenLogoIn: '',
          tokenLogoOut: '',
        };
      }
    }),
  );

  logger.debug({ address, spender, result, response, mergedResult }, 'Got latest transaction list');

  return mergedResult;
};
