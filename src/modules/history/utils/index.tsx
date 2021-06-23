import { DateTime } from 'luxon';

import { ICoingeckoHistories, IChartDate } from '..';
import { fetcher } from '../../fetch';
import { ParaInchToken } from '../../para-inch';

const formatCoingeckoHistory = (data: ICoingeckoHistories): IChartDate[] => {
  let dateLookUpTable: string[] = [];
  let historiesTable: IChartDate[] = [];
  const histories = data.prices.reverse();

  histories.forEach((history: number[]) => {
    const at = history[0];
    const date = DateTime.fromMillis(at).toISODate();
    const value = history[1];

    if (!dateLookUpTable.includes(date)) {
      const item: IChartDate = {
        time: date,
        value,
      };
      dateLookUpTable.push(date);
      historiesTable.push(item);
    }
  });
  return historiesTable.reverse();
};

const getNetworkName = (network: number) => {
  switch (network) {
    case 1:
      return 'ethereum';

    case 56:
      return 'binance-smart-chain';

    default:
      return 'ethereum';
  }
};

// Memo: cast native coin to wrapped coin
const getContractAddress = (address: string, network: number) => {
  const nativeCoinAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
  const wbnb = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

  if (address === nativeCoinAddress) {
    return network === 56 ? wbnb : weth;
  }

  return address;
};

export const getChartData = async (
  fromToken: ParaInchToken,
  toToken: ParaInchToken,
): Promise<IChartDate[] | false> => {
  try {
    // Memo: 6 months
    const days = 182;
    const vsCurrency = 'usd';
    const getUrl = (token: ParaInchToken) =>
      `https://api.coingecko.com/api/v3/coins/${getNetworkName(
        token.network,
      )}/contract/${getContractAddress(
        token.address,
        token.network,
      )}/market_chart/?vs_currency=${vsCurrency}&days=${days}`;

    const results = await Promise.all([
      fetcher<ICoingeckoHistories>(getUrl(fromToken)),
      fetcher<ICoingeckoHistories>(getUrl(toToken)),
    ]);

    const fromTokenHistories = formatCoingeckoHistory(results[0]);
    const toTokenHistories = formatCoingeckoHistory(results[1]);
    const aggregateChartArray = fromTokenHistories.map((fromToken: IChartDate, i: number) => {
      const toToken = toTokenHistories[i];
      return {
        time: fromToken.time,
        value: fromToken.value / toToken.value,
      };
    });
    return aggregateChartArray;
  } catch (error) {
    console.log('error', error);
    // Memo: Coingecko doesn't provide history for some minor coin
    return false;
  }
};
