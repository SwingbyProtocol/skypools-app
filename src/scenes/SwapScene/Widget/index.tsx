import { useMemo, useState } from 'react';

import { Button } from '../../../components/Button';
import { useParaInch } from '../../../modules/para-inch-react';

import { CoinAmountInput, CoinAmountInputValue } from './CoinAmountInput';

export const Widget = () => {
  const { tokens, fromToken, toToken, setFromToken, setToToken } = useParaInch();
  const [amount, setAmount] = useState<CoinAmountInputValue['amount']>(null);

  const from = useMemo(
    (): CoinAmountInputValue => ({ coin: fromToken, amount }),
    [fromToken, amount],
  );

  const to = useMemo((): CoinAmountInputValue => ({ coin: toToken, amount: null }), [toToken]);

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
            setFromToken(coin.address);
          }
        }}
      />
      <div>top</div>
      <CoinAmountInput
        availableCoins={toCoins}
        value={to}
        onChange={({ coin }) => {
          if (coin) {
            setToToken(coin.address);
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
