import { DateTime, Duration } from 'luxon';
import { stringifyUrl } from 'query-string';
import { Prisma } from '@prisma/client';

import { Network } from '../networks';
import { fetcher } from '../fetch';
import { logger } from '../logger';
import {
  isFakeNativeToken,
  isFakeBtcToken,
  BSC_BTCB_ADDRESS,
  ETHEREUM_WBTC_ADDRESS,
} from '../para-inch';

const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const WBNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

const HISTORY_LENGTH = Duration.fromObject({ months: 6 });

type PriceHistoryItem = {
  at: DateTime;
  value: Prisma.Decimal;
};

export type PriceHistory = PriceHistoryItem[];

const getCoingeckoNetworkId = (network: Network) => {
  switch (network) {
    case Network.ETHEREUM:
      return 'ethereum';
    case Network.BSC:
      return 'binance-smart-chain';
  }
};

const getContractAddress = ({ address, network }: { address: string; network: Network }) => {
  if (isFakeNativeToken(address)) {
    return network === Network.BSC ? WBNB_ADDRESS : WETH_ADDRESS;
  }

  if (isFakeBtcToken(address)) {
    return network === Network.BSC ? BSC_BTCB_ADDRESS : ETHEREUM_WBTC_ADDRESS;
  }

  return address;
};

export const getPriceUsd = async ({
  network,
  tokenAddress,
}: {
  network: Network;
  tokenAddress: string;
}): Promise<Prisma.Decimal> => {
  const address = getContractAddress({ address: tokenAddress, network });

  const result = await fetcher<{
    [k: string]: { usd: number };
  }>(
    stringifyUrl({
      url: `https://api.coingecko.com/api/v3/simple/token_price/${getCoingeckoNetworkId(network)}`,
      query: { vs_currencies: 'usd', contract_addresses: address },
    }),
  );

  return new Prisma.Decimal(result[address.toLowerCase()].usd);
};

export const getTokenLogoFromCoingecko = async ({
  network,
  tokenAddress,
}: {
  network: Network;
  tokenAddress: string;
}): Promise<string | null> => {
  try {
    const result = await fetcher<{
      image: { large?: string | null };
    }>(
      isFakeBtcToken(tokenAddress)
        ? 'https://api.coingecko.com/api/v3/coins/bitcoin'
        : `https://api.coingecko.com/api/v3/coins/${getCoingeckoNetworkId(
            network,
          )}/contract/${getContractAddress({
            address: tokenAddress,
            network,
          })}`,
    );

    return result.image.large ?? null;
  } catch (err) {
    logger.trace({ err }, 'Could not fetch coin logo');
    return null;
  }
};

export const getPriceHistoryFromCoingecko = async ({
  network,
  tokenAddress,
}: {
  network: Network;
  tokenAddress: string;
}): Promise<PriceHistory> => {
  const result = await fetcher<{
    prices: Array<[number, number]>;
    market_caps: Array<[number, number]>;
    total_volumes: Array<[number, number]>;
  }>(
    `https://api.coingecko.com/api/v3/coins/${getCoingeckoNetworkId(
      network,
    )}/contract/${getContractAddress({
      address: tokenAddress,
      network,
    })}/market_chart/?vs_currency=usd&days=${HISTORY_LENGTH.as('days')}`,
  );

  return result.prices
    .map(
      ([at, value]): PriceHistoryItem => ({
        at: DateTime.fromMillis(at, { zone: 'utc' }),
        value: new Prisma.Decimal(value),
      }),
    )
    .sort((a, b) => a.at.toMillis() - b.at.toMillis());
};
