import { DateTime } from 'luxon';
import { ParaSwap } from 'paraswap';
import { stringifyUrl } from 'query-string';
import { Big } from 'big.js';

import { shouldUseParaSwap } from '../env';
import { fetcher } from '../fetch';
import { logger } from '../logger';
import { getScanApiUrl } from '../web3';

import { isParaSwapApiError } from './isParaSwapApiError';
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

const getSpender = async ({ network }: { network: SupportedNetworkId }): Promise<string> => {
  if (shouldUseParaSwap) {
    const result = await new ParaSwap(network).getAdapters();
    if (isParaSwapApiError(result) || !result?.augustus.exchange) {
      throw result;
    }

    return result?.augustus.exchange;
  }

  return (
    await fetcher<{ address: string }>(`https://api.1inch.exchange/v3.0/${network}/approve/spender`)
  ).address;
};

export const getLatestTransactions = async ({
  address: addressParam,
  network,
}: {
  address: string;
  network: SupportedNetworkId;
}) => {
  const address = '0xb680c8F33f058163185AB6121F7582BAb57Ef8a7'.toLowerCase(); //addressParam.toLowerCase();
  const spender = (await getSpender({ network })).toLowerCase();

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
      value: new Big(it.value).div('1e18'),
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
