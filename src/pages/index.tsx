import React from 'react';

import { SwapPath } from '../components/SwapPath';
import { PriceChart } from '../components/PriceChart';
import { Card } from '../components/Card';

export default function HomePage() {
  return (
    <>
      <Card>
        <PriceChart depositCurrency="BTC" receivingCurrency="SWINGBY" />

        <SwapPath
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
    </>
  );
}
