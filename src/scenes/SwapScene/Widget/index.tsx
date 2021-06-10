import { useMemo, useState } from 'react';

import { Button } from '../../../components/Button';
import { useCurrentCoins } from '../useCurrentCoins';

import { CoinAmountInput, CoinAmountInputValue } from './CoinAmountInput';

export const Widget = () => {
  const { fromCoin, toCoin, setFromCoin, setToCoin } = useCurrentCoins();

  const [amount, setAmount] = useState<CoinAmountInputValue['amount']>(null);

  const from = useMemo(
    (): CoinAmountInputValue => ({ coin: fromCoin, amount }),
    [fromCoin, amount],
  );

  const to = useMemo((): CoinAmountInputValue => ({ coin: toCoin, amount: null }), [toCoin]);

  return (
    <div>
      <div>from</div>
      <CoinAmountInput
        availableCoins={['BTC', 'WBTC', 'ETH']}
        value={from}
        onChange={({ coin, amount }) => {
          setAmount(amount);
          if (coin) {
            setFromCoin(coin);
          }
        }}
      />
      <div>top</div>
      <CoinAmountInput
        availableCoins={['BTC', 'WBTC', 'ETH']}
        value={to}
        onChange={({ coin }) => {
          if (coin) {
            setToCoin(coin);
          }
        }}
      />
      <Button variant="primary" size="state">
        swap
      </Button>
      <div>details</div>
    </div>
  );
};
