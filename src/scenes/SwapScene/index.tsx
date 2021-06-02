import { DateTime } from 'luxon';
import { useMemo } from 'react';

import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SwapPath } from '../../components/SwapPath';
import { TradingView } from '../../components/TradingView';

import {
  priceAndPathCard,
  chartContainer,
  swapPathContainer,
  swapScene,
  widgetCard,
  headerContainer,
} from './styles';
import { Widget } from './Widget';

export const SwapScene = () => {
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
    <div className={swapScene}>
      <Header className={headerContainer} />

      <Card className={priceAndPathCard}>
        <div className={chartContainer}>
          <TradingView data={data} />
        </div>

        <SwapPath
          className={swapPathContainer}
          initialCoin="BTC"
          value={[
            { toCoin: 'WBTC', via: [{ fraction: 1, platform: 'skybridge' }] },
            {
              toCoin: 'ETH',
              via: [
                { fraction: 'invalid value', platform: 'uniswap-v3' },
                { fraction: 0.25, platform: 'sushiswap-v2' },
              ],
            },
            {
              toCoin: 'USDT',
              via: [
                { fraction: 'invalid value', platform: 'uniswap-v3' },
                { fraction: 0.25, platform: 'sushiswap-v2' },
              ],
            },
            {
              toCoin: 'USDC',
              via: [
                { fraction: 'invalid value', platform: 'uniswap-v3' },
                { fraction: 0.25, platform: 'sushiswap-v2' },
              ],
            },
          ]}
        />
      </Card>

      <Card className={widgetCard}>
        <Widget />
      </Card>
    </div>
  );
};
