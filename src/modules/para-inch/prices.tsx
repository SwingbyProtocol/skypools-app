import { Network } from '@prisma/client';
import { Big } from 'big.js';
import { DateTime, Duration } from 'luxon';
import { stringifyUrl } from 'query-string';

import { fetcher } from '../fetch';

import { isNativeToken } from './isNativeToken';

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const WBNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
const WETH_POLYGON_ADDRESS = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619';

const HISTORY_LENGTH = Duration.fromObject({ months: 6 });

type PriceHistoryItem = {
  at: DateTime;
  value: Big;
};

export type PriceHistory = PriceHistoryItem[];

const getCoingeckoNetworkId = (network: Network) => {
  switch (network) {
    case Network.ETHEREUM:
      return 'ethereum';
    case Network.BSC:
      return 'binance-smart-chain';
    case Network.POLYGON:
      return 'polygon-pos';
  }
};

const getContractAddress = ({ address, network }: { address: string; network: Network }) => {
  if (isNativeToken(address)) {
    return network === Network.POLYGON
      ? WETH_POLYGON_ADDRESS
      : network === Network.BSC
      ? WBNB_ADDRESS
      : WETH_ADDRESS;
  }

  return address;
};

export const getPriceUsd = async ({
  network,
  tokenAddress,
}: {
  network: Network;
  tokenAddress: string;
}): Promise<Big> => {
  const address = getContractAddress({ address: tokenAddress, network });

  const result = await fetcher<{
    [k: string]: { usd: number };
  }>(
    stringifyUrl({
      url: `https://api.coingecko.com/api/v3/simple/token_price/${getCoingeckoNetworkId(network)}`,
      query: { vs_currencies: 'usd', contract_addresses: address },
    }),
  );

  return new Big(result[address.toLowerCase()].usd);
};

export const getPriceHistory = async ({
  network,
  fromTokenAddress,
  toTokenAddress,
}: {
  network: Network;
  fromTokenAddress: string;
  toTokenAddress: string;
}): Promise<PriceHistory> => {
  const [fromTokenHistories, toTokenHistories] = (
    await Promise.all(
      [fromTokenAddress, toTokenAddress].map((address) =>
        fetcher<{
          prices: Array<[number, number]>;
          market_caps: Array<[number, number]>;
          total_volumes: Array<[number, number]>;
        }>(
          `https://api.coingecko.com/api/v3/coins/${getCoingeckoNetworkId(
            network,
          )}/contract/${getContractAddress({
            address,
            network,
          })}/market_chart/?vs_currency=usd&days=${HISTORY_LENGTH.as('days')}`,
        ),
      ),
    )
  ).map((data) => {
    return data.prices
      .map(
        ([at, value]): PriceHistoryItem => ({
          at: DateTime.fromMillis(at, { zone: 'utc' }),
          value: new Big(value),
        }),
      )
      .sort((a, b) => a.at.toMillis() - b.at.toMillis());
  });

  return fromTokenHistories
    .map((fromToken) => {
      const toToken = toTokenHistories.find(({ at }) => fromToken.at.toMillis() === at.toMillis());
      if (!toToken) {
        return null;
      }

      return {
        at: fromToken.at,
        value: fromToken.value.div(toToken.value),
      };
    })
    .filter((it): it is PriceHistoryItem => !!it);
};
