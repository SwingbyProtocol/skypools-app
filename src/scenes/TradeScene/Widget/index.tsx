import { Big } from 'big.js';
import { validate, Network } from 'bitcoin-address-validation';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import { Button } from '../../../components/Button';
import { TextInput } from '../../../components/TextInput';
import { useOnboard } from '../../../modules/onboard';
import { useCreateSwap, useParaInchForm } from '../../../modules/para-inch-react';

import { CoinAmountInput, CoinAmountInputValue } from './CoinAmountInput';
import {
  container,
  depositValue,
  direction,
  error,
  fromInput,
  fromLabel,
  info,
  infoLabel,
  infoValue,
  infoValueHighlight,
  invalidAddressFormat,
  label,
  labelAddress,
  link,
  reverse,
  rowBtcAddress,
  swap as swapButton,
  toInput,
  toLabel,
} from './styles';

export const Widget = () => {
  const {
    tokens,
    fromToken,
    toToken,
    setFromToken,
    setToToken,
    setToken,
    amount,
    setAmount,
    isAmountValid,
    swapQuote,
    errorMsg,
  } = useParaInchForm();

  const {
    depositedBalance,
    btcAddress,
    setBtcAddress,
    createSwap,
    isLoading,
    isQuote,
    isSkypools,
    createSwapError,
    isFloatShortage,
    minAmount,
    isEnoughDeposit,
  } = useCreateSwap();

  const { address, network } = useOnboard();
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const btcNetwork = network === 'ROPSTEN' ? Network.testnet : Network.mainnet;
  const isToBtc = toToken?.symbol === 'BTC';

  const commonSwapDisabled = isLoading || !isQuote || !address || errorMsg !== '';
  const isSkypoolsDisabled = !isEnoughDeposit || isFloatShortage || (isToBtc && !isValidAddress);

  const isSwapDisabled = isSkypools ? isSkypoolsDisabled || commonSwapDisabled : commonSwapDisabled;

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
        <div css={reverse}>
          <div
            css={direction}
            onClick={() => {
              if (!to.coin || !from.coin) return;
              setToken({ from: from.coin?.address, to: to.coin?.address });
            }}
          >
            ↕
          </div>
        </div>
        <div>
          <FormattedMessage id="widget.to" />
        </div>
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

      {isToBtc && isEnoughDeposit && (
        <div css={rowBtcAddress}>
          <div css={labelAddress}>
            <FormattedMessage id="btc-destination-address" />
          </div>
          <TextInput
            size="city"
            value={btcAddress ?? ''}
            onChange={(evt) => {
              setBtcAddress(evt.target.value);
              if (validate(evt.target.value, btcNetwork)) {
                setIsValidAddress(true);
              } else {
                setIsValidAddress(false);
              }
            }}
          />
          {btcAddress !== '' && !isValidAddress && (
            <div css={invalidAddressFormat}>
              <FormattedMessage id="invalid-address-format" />
            </div>
          )}
        </div>
      )}

      {(!address || isEnoughDeposit || !isSkypools) && (
        <Button
          variant="primary"
          size="state"
          css={swapButton}
          disabled={isSwapDisabled}
          onClick={createSwap ?? undefined}
        >
          <FormattedMessage id="widget.swap" values={{ value: fromToken?.symbol }} />
        </Button>
      )}

      {address && isSkypools && !isEnoughDeposit && (
        <div css={swapButton}>
          <Link href={'/deposit'}>
            <a href="/deposit" css={link}>
              <Button variant="secondary" size="state">
                <FormattedMessage id="widget.deposit" values={{ value: fromToken?.symbol }} />
              </Button>
            </a>
          </Link>
        </div>
      )}

      {errorMsg && <div css={error}>{errorMsg}</div>}
      {createSwapError && <div css={error}>{createSwapError}</div>}

      {isAmountValid && swapQuote && (
        <table css={info}>
          <tbody>
            <tr>
              <td>
                <FormattedMessage id="swap.deposited-balance" />
              </td>
              <td css={depositValue}>
                <FormattedMessage
                  id="token-amount"
                  values={{
                    amount: (
                      <FormattedNumber
                        value={Number(depositedBalance.amount)}
                        maximumFractionDigits={8}
                      />
                    ),
                    token: depositedBalance.token,
                  }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <FormattedMessage id="swap.min-receiving-amount" />
              </td>
              <td css={depositValue}>
                <FormattedMessage
                  id="token-amount"
                  values={{
                    amount: (
                      <FormattedNumber value={Number(minAmount.amount)} maximumFractionDigits={8} />
                    ),
                    token: minAmount.token,
                  }}
                />
              </td>
            </tr>
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
            {!!swapQuote.bestRoute.estimatedGasUsd && !isSkypools && (
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
