import { Big } from 'big.js';
import { validate, Network } from 'bitcoin-address-validation';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import { Button } from '../../../components/Button';
import { TextInput } from '../../../components/TextInput';
import { useParaInchForm, useCreateSwap } from '../../../modules/para-inch-react';
import { useWalletConnection } from '../../../modules/hooks/useWalletConnection';
import { Loading } from '../../../components/Loading';

import { CoinAmountInput, CoinAmountInputValue } from './CoinAmountInput';
import {
  container,
  minimumReceivingValue,
  direction,
  error,
  fromInput,
  fromLabel,
  info,
  infoLabel,
  infoValue,
  invalidAddressFormat,
  label,
  labelAddress,
  link,
  reverse,
  rowBtcAddress,
  swap as swapButton,
  toInput,
  toLabel,
  rowBalance,
  max,
  explorer,
  detailLink,
  warning,
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
    warningMsg,
  } = useParaInchForm();

  const {
    btcAddress,
    setBtcAddress,
    createSwap,
    toMaxAmount,
    balance,
    isLoading,
    isQuote,
    isSkyPools,
    createSwapError,
    isFloatShortage,
    minAmount,
    isEnoughDeposit,
    explorerLink,
    hasEnoughAllowance,
    requestAllowance,
  } = useCreateSwap();

  const { address, network } = useWalletConnection();
  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const btcNetwork = network === 'ROPSTEN' ? Network.testnet : Network.mainnet;
  const isToBtc = toToken?.symbol === 'BTC';
  const fromBtc = fromToken?.symbol === 'BTC';

  const commonSwapDisabled = isLoading || !isQuote || !address || errorMsg !== '';
  const isSkypoolsDisabled = !isEnoughDeposit || isFloatShortage || (isToBtc && !isValidAddress);

  const isSwapDisabled = isSkyPools ? isSkypoolsDisabled || commonSwapDisabled : commonSwapDisabled;

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
      <div css={fromInput}>
        <CoinAmountInput
          availableCoins={tokens}
          value={from}
          onChange={({ coin, amount }) => {
            setAmount(amount);
            if (coin) {
              setFromToken(coin.address);
            }
          }}
          disabled={fromBtc ? 'erc20' : undefined}
        />
        {address && (
          <div css={rowBalance}>
            <div>
              <FormattedMessage
                id={isSkyPools ? 'swap.deposited-balance' : 'swap.wallet-balance'}
              />
            </div>
            <div>
              <FormattedMessage
                id="token-amount"
                values={{
                  token: balance.token,
                  amount: (
                    <FormattedNumber value={Number(balance.amount)} maximumFractionDigits={4} />
                  ),
                }}
              />
            </div>
            <div
              css={max}
              onClick={() =>
                (async () => {
                  if (!toMaxAmount) return;
                  await toMaxAmount();
                })()
              }
            >
              <FormattedMessage id="max" />
            </div>
          </div>
        )}
      </div>

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
        onChange={({ coin }) => {
          if (coin) {
            setToToken(coin.address);
          }
        }}
        disabled={!fromBtc ? 'all' : 'amount'}
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
                return;
              }
              setIsValidAddress(false);
            }}
          />
          {btcAddress !== '' && !isValidAddress && (
            <div css={invalidAddressFormat}>
              <FormattedMessage id="invalid-address-format" />
            </div>
          )}
        </div>
      )}

      {(!address || isEnoughDeposit || !isSkyPools) && hasEnoughAllowance && (
        <Button
          variant="primary"
          size="state"
          css={swapButton}
          disabled={isSwapDisabled}
          onClick={createSwap ?? undefined}
        >
          <FormattedMessage id="widget.swap" values={{ value: fromToken?.symbol }} />
          {isLoading ? <Loading css={{ marginLeft: '7px' }} /> : null}
        </Button>
      )}

      {!hasEnoughAllowance && (
        <Button
          variant="primary"
          size="state"
          css={swapButton}
          disabled={isSwapDisabled}
          onClick={requestAllowance ?? undefined}
        >
          <FormattedMessage id="widget.approve" values={{ value: fromToken?.symbol }} />
          {isLoading ? <Loading css={{ marginLeft: '7px' }} /> : null}
        </Button>
      )}

      {address && isSkyPools && !isEnoughDeposit && (
        <div css={swapButton}>
          <Link href={'/deposit'}>
            <a href="/deposit" css={link}>
              <Button variant="secondary" size="state">
                <FormattedMessage id="widget.deposit" values={{ value: fromToken?.symbol }} />
                {isLoading ? <Loading css={{ marginLeft: '7px' }} /> : null}
              </Button>
            </a>
          </Link>
        </div>
      )}

      {warningMsg && <div css={warning}>{warningMsg}</div>}
      {errorMsg && <div css={error}>{errorMsg}</div>}
      {createSwapError && <div css={error}>{createSwapError}</div>}
      {explorerLink && (
        <div css={explorer}>
          <div>
            <FormattedMessage id="transaction-submitted" />
          </div>
          <a href={explorerLink} target="_blank" rel="noopener noreferrer" css={detailLink}>
            <FormattedMessage id="view-on-explorer" values={{ value: 'Etherscan' }} />
          </a>
        </div>
      )}

      {isAmountValid && swapQuote && (
        <table css={info}>
          <tbody>
            {isSkyPools && (
              <tr>
                <td>
                  <FormattedMessage id="swap.min-receiving-amount" />
                </td>
                <td css={minimumReceivingValue}>
                  <FormattedMessage
                    id="token-amount"
                    values={{
                      amount: (
                        <FormattedNumber
                          value={Number(minAmount.amount)}
                          maximumFractionDigits={8}
                        />
                      ),
                      token: minAmount.token,
                    }}
                  />
                </td>
              </tr>
            )}
            <tr>
              <td css={infoLabel} rowSpan={2}>
                <FormattedMessage id="widget.details.rate" />
              </td>
              <td css={infoValue}>
                1&nbsp;{fromToken?.symbol}&nbsp;=&nbsp;
                <span>
                  <FormattedNumber
                    value={new Big(swapQuote.srcTokenPriceUsd)
                      .div(
                        new Big(swapQuote.destTokenPriceUsd).eq(0)
                          ? 1
                          : swapQuote.destTokenPriceUsd,
                      )
                      .toNumber()}
                    maximumSignificantDigits={8}
                  />
                </span>
                &nbsp;
                {toToken?.symbol}
              </td>
            </tr>
            <tr>
              <td css={infoValue}>
                1&nbsp;{toToken?.symbol}&nbsp;=&nbsp;
                <span>
                  <FormattedNumber
                    value={new Big(swapQuote.destTokenPriceUsd)
                      .div(
                        new Big(swapQuote.srcTokenPriceUsd).eq(0) ? 1 : swapQuote.srcTokenPriceUsd,
                      )
                      .toNumber()}
                    maximumSignificantDigits={8}
                  />
                </span>
                &nbsp;
                {fromToken?.symbol}
              </td>
            </tr>
            {!!swapQuote.bestRoute.estimatedGasUsd && !isSkyPools && (
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
