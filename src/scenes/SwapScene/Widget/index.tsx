import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import { Button } from '../../../components/Button';
import { TransactionStatus, useSkybridgeSwapInfoLazyQuery } from '../../../generated/graphql';
import { useParaInch, useParaInchSwap } from '../../../modules/para-inch-react';
import { shortenAddress } from '../../../modules/short-address';

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
  skybridge,
  skybridgeCompleted,
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
  } = useParaInch();
  const { query } = useRouter();
  const skybridgeSwap = (() => {
    const value = query.skybridgeSwap;
    if (typeof value !== 'string' || !value) {
      return null;
    }

    return value;
  })();

  const { isApprovalNeeded, approve, swap } = useParaInchSwap();
  const [getSwapInfo, { data, loading, stopPolling, startPolling }] =
    useSkybridgeSwapInfoLazyQuery();

  useEffect(() => {
    if (!skybridgeSwap) return;
    getSwapInfo({ variables: { id: skybridgeSwap } });
  }, [getSwapInfo, skybridgeSwap]);

  useEffect(() => {
    if (data?.transaction.status !== TransactionStatus.Completed) {
      startPolling?.(15000);
    }

    return () => {
      stopPolling?.();
    };
  }, [data, stopPolling, startPolling]);

  const from = useMemo(
    (): CoinAmountInputValue => ({
      coin: fromToken,
      amount,
      amountInfo:
        !isAmountValid || !swapQuote?.fromTokenAmountUsd ? null : (
          <FormattedNumber
            value={swapQuote.fromTokenAmountUsd.toNumber()}
            style="currency" // eslint-disable-line react/style-prop-object
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
      amount: (!isAmountValid ? null : swapQuote?.bestRoute.toTokenAmount.toFixed()) ?? null,
      amountInfo:
        !isAmountValid || !swapQuote?.bestRoute.toTokenAmountUsd ? null : (
          <FormattedNumber
            value={swapQuote.bestRoute.toTokenAmountUsd.toNumber()}
            style="currency" // eslint-disable-line react/style-prop-object
            currency="USD"
            currencyDisplay="narrowSymbol"
          />
        ),
    }),
    [
      toToken,
      swapQuote?.bestRoute.toTokenAmount,
      swapQuote?.bestRoute.toTokenAmountUsd,
      isAmountValid,
    ],
  );

  const toCoins = useMemo(
    () => tokens.filter((it) => it.address !== from.coin?.address),
    [tokens, from.coin?.address],
  );

  return (
    <div css={container}>
      {!!skybridgeSwap && (
        <div
          css={[
            skybridge,
            data?.transaction.status === TransactionStatus.Completed && skybridgeCompleted,
          ]}
        >
          {loading && <div>loading</div>}
          {!!data && (
            <div>
              {data.transaction.status !== TransactionStatus.Completed ? (
                <FormattedMessage
                  id="widget.skybridge.waiting"
                  values={{
                    status: data.transaction.status,
                    swap: (
                      <a
                        href={`https://widget.skybridge.exchange/production/swap/${data.transaction.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={data.transaction.id}
                      >
                        {shortenAddress({ value: data.transaction.id })}
                      </a>
                    ),
                  }}
                />
              ) : (
                <FormattedMessage
                  id="widget.skybridge.completed"
                  values={{
                    swap: (
                      <a
                        href={`https://widget.skybridge.exchange/production/swap/${data.transaction.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={data.transaction.id}
                      >
                        {shortenAddress({ value: data.transaction.id })}
                      </a>
                    ),
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

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
          <tbody>
            <tr>
              <td css={infoLabel} rowSpan={2}>
                <FormattedMessage id="widget.details.rate" />
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
            {!!swapQuote.bestRoute.estimatedGasUsd && (
              <tr>
                <td css={infoLabel}>
                  <FormattedMessage id="widget.details.gas" />
                </td>
                <td css={infoValue}>
                  <FormattedNumber
                    value={swapQuote.bestRoute.estimatedGasUsd.toNumber()}
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
