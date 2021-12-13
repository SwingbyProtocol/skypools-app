import { useMemo } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Big } from 'big.js';

import { Button } from '../../../components/Button';
import { useParaInchForm, useParaInchCreateSwap } from '../../../modules/para-inch-react';
import { useOnboard } from '../../../modules/onboard';

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
  error,
} from './styles';

export const Widget = () => {
  const {
    tokens,
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    amount,
    setAmount,
    isAmountValid,
    swapQuote,
    errorMsg,
  } = useParaInchForm();
  const { isApprovalNeeded, approve, createSwap, isLoading, isQuote, isSkypools, createSwapError } =
    useParaInchCreateSwap();
  const { address } = useOnboard();

  const from = useMemo(
    (): CoinAmountInputValue => ({
      coin: fromToken,
      amount,
      amountInfo:
        !isAmountValid || !swapQuote?.srcTokenAmountUsd ? null : (
          <FormattedNumber
            value={+swapQuote.srcTokenAmountUsd}
            style="currency" // eslint-disable-line react/style-prop-object
            currency="USD"
            currencyDisplay="narrowSymbol"
          />
        ),
    }),
    [fromToken, amount, swapQuote?.srcTokenAmountUsd, isAmountValid],
  );

  const to = useMemo(
    (): CoinAmountInputValue => ({
      coin: toToken,
      amount: (!isAmountValid ? null : swapQuote?.bestRoute.destTokenAmount) ?? null,
      amountInfo:
        !isAmountValid || !swapQuote?.bestRoute.destTokenAmountUsd ? null : (
          <FormattedNumber
            value={+swapQuote.bestRoute.destTokenAmountUsd}
            style="currency" // eslint-disable-line react/style-prop-object
            currency="USD"
            currencyDisplay="narrowSymbol"
          />
        ),
    }),
    [
      toToken,
      swapQuote?.bestRoute.destTokenAmount,
      swapQuote?.bestRoute.destTokenAmountUsd,
      isAmountValid,
    ],
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
        disabled="amount"
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
          disabled={isApprovalNeeded === null || isLoading || !isQuote || !address}
          onClick={createSwap ?? undefined}
        >
          <FormattedMessage
            id={isSkypools ? 'widget.deposit' : 'widget.swap'}
            values={{ value: fromToken?.symbol }}
          />
        </Button>
      )}
      {!!isApprovalNeeded && (
        <Button variant="primary" size="state" css={swapButton} onClick={approve}>
          <FormattedMessage id="widget.approve" />
        </Button>
      )}

      {errorMsg && <div css={error}>{errorMsg}</div>}
      {createSwapError && <div css={error}>{createSwapError}</div>}

      {isAmountValid && swapQuote && (
        <table css={info}>
          <tbody>
            <tr>
              <td css={infoLabel} rowSpan={2}>
                <FormattedMessage id="widget.details.rate" />
              </td>
              <td css={infoValue}>
                1&nbsp;{fromToken?.symbol}&nbsp;=&nbsp;
                <span css={infoValueHighlight}>
                  <FormattedNumber
                    value={new Big(swapQuote.srcTokenPriceUsd)
                      .div(swapQuote.destTokenPriceUsd)
                      .toNumber()}
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
                    value={new Big(swapQuote.destTokenPriceUsd)
                      .div(swapQuote.srcTokenPriceUsd)
                      .toNumber()}
                    maximumSignificantDigits={6}
                  />
                </span>
                &nbsp;
                {fromToken?.symbol}
              </td>
            </tr>
            {!!swapQuote.bestRoute.estimatedGasUsd && (
              <tr>
                <td css={infoLabel}>
                  <FormattedMessage id="widget.details.gas" />
                </td>
                <td css={infoValue}>
                  <FormattedNumber
                    value={+swapQuote.bestRoute.estimatedGasUsd}
                    style="currency" // eslint-disable-line react/style-prop-object
                    currency="USD"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
