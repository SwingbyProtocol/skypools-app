import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { Big } from 'big.js';

import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SwapPath } from '../../components/SwapPath';
import { TradingView } from '../../components/TradingView';
import { useSwapQuote } from '../../modules/1inch';

import {
  priceAndPathCard,
  chartContainer,
  swapPathContainer,
  swapScene,
  widgetCard,
  headerContainer,
  historyCard,
} from './styles';
import { Widget } from './Widget';
import { History } from './History';
import { useCurrentCoins } from './useCurrentCoins';

export const SwapScene = () => {
  const { fromCoin, toCoin } = useCurrentCoins();
  const { swapPath } = useSwapQuote({
    fromTokenAddress: fromCoin?.address,
    toTokenAddress: toCoin?.address,
    amount: new Big(1).times('1e18').toFixed(),
  });

  const data = useMemo(() => {
    const BASE_DATE = DateTime.fromISO('2021-05-27T13:44:12.621Z');
    return new Array(500)
      .fill(null)
      .map((_, index) => ({
        time: BASE_DATE.plus({ days: index }).toISO(),
        value: Math.pow(index, 2),
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, []);

  return (
    <div css={swapScene}>
      <Header css={headerContainer} />

      <Card css={priceAndPathCard}>
        <div css={chartContainer}>
          <TradingView data={data} />
        </div>

        {!!swapPath?.routes && <SwapPath css={swapPathContainer} value={swapPath.routes[0]} />}
      </Card>

      <Card css={widgetCard}>
        <Widget />
      </Card>

      <History css={historyCard} />
    </div>
  );
};
