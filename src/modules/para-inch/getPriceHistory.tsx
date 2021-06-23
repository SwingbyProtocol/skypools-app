import { Big } from 'big.js';
import { DateTime, Duration } from 'luxon';

import { fetcher } from '../fetch';

import { isNativeToken } from './isNativeToken';
import { SupportedNetworkId } from './isSupportedNetwork';

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const WBNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

const HISTORY_LENGTH = Duration.fromObject({ months: 6 });

type PriceHistoryItem = {
  at: DateTime;
  value: Big;
};

export type PriceHistory = PriceHistoryItem[];

const getCoingeckoNetworkId = (network: SupportedNetworkId) => {
  switch (network) {
    case 1:
      return 'ethereum';
    case 56:
      return 'binance-smart-chain';
  }
};

const getContractAddress = ({
  address,
  network,
}: {
  address: string;
  network: SupportedNetworkId;
}) => {
  if (isNativeToken(address)) {
    return network === 56 ? WBNB_ADDRESS : WETH_ADDRESS;
  }

  return address;
};

export const getPriceHistory = async ({
  network,
  fromTokenAddress,
  toTokenAddress,
}: {
  network: SupportedNetworkId;
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
