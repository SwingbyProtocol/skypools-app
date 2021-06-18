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
      coin:
        tokens.find(
          ({ address }) =>
            typeof fromCoin === 'string' && address.toLowerCase() === fromCoin.toLowerCase(),
        ) ?? null,
      amount,
    }),
    [tokens, fromCoin, amount],
  );

  const to = useMemo(
    (): CoinAmountInputValue => ({
      coin:
        tokens.find(
          ({ address }) =>
            typeof toCoin === 'string' && address.toLowerCase() === toCoin.toLowerCase(),
        ) ?? null,
      amount: null,
    }),
    [toCoin, tokens],
  );

  const toCoins = useMemo(
    () => tokens.filter((it) => it.address !== from.coin?.address),
    [tokens, from.coin?.address],
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
        availableCoins={toCoins}
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
