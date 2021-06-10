import { useState } from 'react';

import { Button } from '../../../components/Button';

import { CoinAmountInput, CoinAmountInputValue } from './CoinAmountInput';

export const Widget = () => {
  const [from, setFrom] = useState<CoinAmountInputValue>({ coin: null, amount: null });
  const [to, setTo] = useState<CoinAmountInputValue>({ coin: null, amount: null });

  return (
    <div>
      <div>from</div>
      <CoinAmountInput availableCoins={['BTC', 'WBTC', 'ETH']} value={from} onChange={setFrom} />
      <div>top</div>
      <CoinAmountInput availableCoins={['BTC', 'WBTC', 'ETH']} value={to} onChange={setTo} />
      <Button variant="primary" size="state">
        swap
      </Button>
      <div>details</div>
    </div>
  );
};
