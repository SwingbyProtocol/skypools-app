import { Button } from '../../../components/Button';

import { CoinAmountInput } from './CoinAmountInput';

export const Widget = () => {
  return (
    <div>
      <div>from</div>
      <CoinAmountInput availableCoins={['BTC', 'WBTC', 'ETH']} />
      <div>top</div>
      <Button variant="primary" size="state">
        swap
      </Button>
      <div>details</div>
    </div>
  );
};
