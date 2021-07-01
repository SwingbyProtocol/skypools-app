import { Big } from 'big.js';
import { useMemo } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import { Button } from '../../../components/Button';
import { useParaInch, useSwapQuote } from '../../../modules/para-inch-react';

import { CoinAmountInput, CoinAmountInputValue } from './CoinAmountInput';
import {
  label,
  fromInput,
  fromLabel,
  toInput,
  toLabel,
  container,
  swap as swapButton,
  info,
  infoLabel,
  infoValue,
  infoValueHighlight,
} from './styles';

export const Widget = ({
  swapQuote,
  approve,
  isApprovalNeeded,
  swap,
}: Pick<
  ReturnType<typeof useSwapQuote>,
  'approve' | 'isApprovalNeeded' | 'swapQuote' | 'swap'
>) => {
  const { tokens, fromToken, toToken, setFromToken, setToToken, amount, setAmount, isAmountValid } =
    useParaInch();

  const from = useMemo(
    (): CoinAmountInputValue => ({
      coin: fromToken,
      amount,
      amountInfo:
        !isAmountValid || !swapQuote?.fromTokenAmountUsd ? null : (
          <FormattedNumber
            value={swapQuote.fromTokenAmountUsd.toNumber()}
            style="currency"
            currency="USD"
            currencyDisplay="narrowSymbol"
          />
        ),
    }),
    [fromToken, amount, swapQuote?.fromTokenAmountUsd, isAmountValid],
  );

  const to = useMemo(
    (): CoinAmountInputValue => ({
      coin: toToken,
      amount: (!isAmountValid ? null : swapQuote?.toTokenAmount.toFixed()) ?? null,
      amountInfo:
        !isAmountValid || !swapQuote?.toTokenAmountUsd ? null : (
          <FormattedNumber
            value={swapQuote.toTokenAmountUsd.toNumber()}
            style="currency"
            currency="USD"
            currencyDisplay="narrowSymbol"
          />
        ),
    }),
    [toToken, swapQuote?.toTokenAmount, swapQuote?.toTokenAmountUsd, isAmountValid],
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
      {!isApprovalNeeded && (
        <Button
          variant="primary"
          size="state"
          css={swapButton}
          disabled={isApprovalNeeded === null}
          onClick={swap ?? undefined}
        >
          <FormattedMessage id="widget.swap" />
        </Button>
      )}
      {!!isApprovalNeeded && (
        <Button variant="primary" size="state" css={swapButton} onClick={approve}>
          <FormattedMessage id="widget.approve" />
        </Button>
      )}
      {isAmountValid && swapQuote && (
        <table css={info}>
          <tr>
            <td css={infoLabel} rowSpan={2}>
              Rate
            </td>
            <td css={infoValue}>
              1&nbsp;{fromToken?.symbol}&nbsp;=&nbsp;
              <span css={infoValueHighlight}>
                <FormattedNumber
                  value={swapQuote.fromTokenPriceUsd.times(swapQuote.toTokenPriceUsd).toNumber()}
                  maximumSignificantDigits={6}
                />
              </span>
              &nbsp;
              {toToken?.symbol}
            </td>
          </tr>
          <tr>
            <td css={infoValue}>
              1&nbsp;{toToken?.symbol}&nbsp;=&nbsp;
              <span css={infoValueHighlight}>
                <FormattedNumber
                  value={swapQuote.toTokenPriceUsd.div(swapQuote.fromTokenPriceUsd).toNumber()}
                  maximumSignificantDigits={6}
                />
              </span>
              &nbsp;
              {fromToken?.symbol}
            </td>
          </tr>
        </table>
      )}
    </div>
  );
};
