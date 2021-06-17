import { useMemo, useState } from 'react';

import { Button } from '../../../components/Button';
import { useTokens } from '../../../modules/1inch';
import { useCurrentCoins } from '../useCurrentCoins';

import { CoinAmountInput, CoinAmountInputValue } from './CoinAmountInput';

export const Widget = () => {
  const { tokens } = useTokens();
  const { fromCoin, toCoin, setFromCoin, setToCoin } = useCurrentCoins();

  const [amount, setAmount] = useState<CoinAmountInputValue['amount']>(null);

  const from = useMemo(
    (): CoinAmountInputValue => ({
      coin: tokens.find(({ address }) => address === fromCoin) ?? null,
      amount,
    }),
    [tokens, fromCoin, amount],
  );

  const to = useMemo(
    (): CoinAmountInputValue => ({
      coin: tokens.find(({ address }) => address === toCoin) ?? null,
      amount: null,
    }),
    [toCoin, tokens],
  );

  return (
    <div>
      <div>from</div>
      <CoinAmountInput
        availableCoins={tokens}
        value={from}
        onChange={({ coin, amount }) => {
          setAmount(amount);
          if (coin) {
            setFromCoin(coin.address);
          }
        }}
      />
      <div>top</div>
      <CoinAmountInput
        availableCoins={tokens.filter((it) => it.address !== from.coin?.address)}
        value={to}
        onChange={({ coin }) => {
          if (coin) {
            setToCoin(coin.address);
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
