import { Big } from 'big.js';
import { useMemo, useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import { Button } from '../../../components/Button';
import { SwapQuote } from '../../../modules/para-inch';
import { useParaInch } from '../../../modules/para-inch-react';

import { CoinAmountInput, CoinAmountInputValue } from './CoinAmountInput';
import { label, fromInput, fromLabel, toInput, toLabel, container, swap } from './styles';

export const Widget = ({ swapQuote }: { swapQuote: SwapQuote | null }) => {
  const { tokens, fromToken, toToken, setFromToken, setToToken, amount, setAmount } = useParaInch();

  const from = useMemo(
    (): CoinAmountInputValue => ({
      coin: fromToken,
      amount,
      amountInfo:
        !amount || !swapQuote?.fromTokenAmountUsd ? null : (
          <FormattedNumber
            value={swapQuote.fromTokenAmountUsd.toNumber()}
            style="currency"
            currency="USD"
            currencyDisplay="narrowSymbol"
          />
        ),
    }),
    [fromToken, amount, swapQuote?.fromTokenAmountUsd],
  );

  const to = useMemo(
    (): CoinAmountInputValue => ({
      coin: toToken,
      amount: (!amount ? null : swapQuote?.toTokenAmount.toFixed()) ?? null,
      amountInfo:
        !amount || !swapQuote?.toTokenAmountUsd ? null : (
          <FormattedNumber
            value={swapQuote.toTokenAmountUsd.toNumber()}
            style="currency"
            currency="USD"
            currencyDisplay="narrowSymbol"
          />
        ),
    }),
    [toToken, amount, swapQuote?.toTokenAmount, swapQuote?.toTokenAmountUsd],
  );

  const toCoins = useMemo(
    () => tokens.filter((it) => it.address !== from.coin?.address),
    [tokens, from.coin?.address],
  );

  return (
    <div css={container}>
      <div css={[label, fromLabel]}>
        <FormattedMessage id="widget.from" />
      </div>
      <CoinAmountInput
        css={fromInput}
        availableCoins={tokens}
        value={from}
        onChange={({ coin, amount }) => {
          setAmount(amount);
          if (coin) {
            setFromToken(coin.address);
          }
        }}
      />
      <div css={[label, toLabel]}>
        <FormattedMessage id="widget.to" />
      </div>
      <CoinAmountInput
        css={toInput}
        availableCoins={toCoins}
        value={to}
        amountDisabled
        onChange={({ coin }) => {
          if (coin) {
            setToToken(coin.address);
          }
        }}
      />
      <Button variant="primary" size="state" css={swap}>
        <FormattedMessage id="widget.swap" />
      </Button>
      {swapQuote && (
        <>
          <div>
            ratio: 1 {fromToken?.symbol} ={' '}
            {swapQuote.fromTokenPriceUsd.times(swapQuote.toTokenPriceUsd).toFixed()}{' '}
            {toToken?.symbol}
          </div>
          <div>
            ratio: 1 {toToken?.symbol} ={' '}
            {swapQuote.toTokenPriceUsd.div(swapQuote.fromTokenPriceUsd).toFixed()}{' '}
            {fromToken?.symbol}
          </div>
        </>
      )}
    </div>
  );
};
