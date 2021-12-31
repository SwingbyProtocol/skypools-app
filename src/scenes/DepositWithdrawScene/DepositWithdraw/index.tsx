import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Head from 'next/head';

import { Button } from '../../../components/Button';
import { CoinAmountInputValue, CoinInfo, CoinInput } from '../../../components/CoinInput';
import { ConnectWalletButton } from '../../../components/ConnectWalletButton';
import { BtcDeposit } from '../BtcDeposit';
import { TextInput } from '../../../components/TextInput';
import { useBtcDeposits } from '../../../modules/localstorage';
import { useOnboard } from '../../../modules/onboard';
import { useDepositWithdraw, useTokens } from '../../../modules/para-inch-react';

import {
  buttonContainer,
  container,
  rowDepositBalance,
  fromAmount,
  label,
  historyBox,
  historyCard,
  historyContainer,
  error,
  textInput,
  max,
  explorer,
  detailLink,
} from './styles';

export const DepositWithdraw = () => {
  const { tokens } = useTokens();
  const [fromToken, setFromToken] = useState<CoinInfo>(tokens[0]);
  const { address } = useOnboard();
  const {
    depositedBalance,
    amount,
    isApprovalNeeded,
    errorMsg,
    handleDeposit,
    approve,
    setAmount,
    handleWithdraw,
    isDeposit,
    toMaxAmount,
    explorerLink,
  } = useDepositWithdraw(fromToken);

  const { depositTxs } = useBtcDeposits();

  const { query } = useRouter();
  const skybridgeId = query.skybridgeId;

  const from = useMemo(
    (): CoinAmountInputValue => ({
      coin: fromToken,
    }),
    [fromToken],
  );

  const isDisabledDeposit = 0 >= Number(amount);
  const isDisabledWithdraw =
    Number(amount) > Number(depositedBalance.amount) || Number(amount) === 0;
  const isMax = !isDeposit || (isDeposit && fromToken.symbol !== 'BTC');

  useEffect(() => {
    if (skybridgeId) {
      const btc = tokens.find((it) => it.symbol === 'BTC');
      btc && setFromToken(btc);
    }
  }, [skybridgeId, tokens]);

  return (
    <>
      <Head>
        <title>Swingby SkyPools | {isDeposit ? 'Deposit' : 'Withdraw'}</title>
      </Head>
      <div css={container}>
        <div>
          <div css={fromAmount}>
            <div>
              <div css={label}>
                <FormattedMessage id="widget.from" />
              </div>
              <CoinInput
                availableCoins={tokens}
                value={from}
                onChange={({ coin }) => {
                  if (coin) {
                    setFromToken(coin);
                  }
                }}
              />
            </div>
            <div>
              <div css={label}>
                <FormattedMessage id="widget.amount" />
                {isMax && (
                  <div css={max} onClick={toMaxAmount}>
                    <FormattedMessage id="max" />
                  </div>
                )}
              </div>
              <TextInput
                css={textInput}
                size="country"
                value={amount}
                onChange={(evt) => {
                  if (!isNaN(Number(evt.target.value))) {
                    setAmount(evt.target.value);
                  }
                }}
              />
            </div>
          </div>
          <div css={rowDepositBalance}>
            <div>
              <FormattedMessage id="widget.deposit-balance" />
            </div>
            <div>
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
            </div>
          </div>
          <div css={buttonContainer}>
            {!address ? (
              <ConnectWalletButton />
            ) : (
              <Button
                variant="primary"
                size="city"
                shape="fit"
                disabled={!isApprovalNeeded && (isDeposit ? isDisabledDeposit : isDisabledWithdraw)}
                onClick={!!isApprovalNeeded ? approve : isDeposit ? handleDeposit : handleWithdraw}
              >
                <FormattedMessage
                  id={
                    !!isApprovalNeeded
                      ? 'widget.approve'
                      : isDeposit
                      ? 'widget.deposit'
                      : 'swap.withdraw'
                  }
                  values={{ value: fromToken?.symbol }}
                />
              </Button>
            )}
          </div>
          {errorMsg && <div css={error}>{errorMsg}</div>}
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
        </div>
        {(fromToken.symbol === 'BTC' || skybridgeId) && depositTxs.length > 0 && isDeposit && (
          <div css={historyContainer}>
            <div css={historyBox}>
              <BtcDeposit css={historyCard} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
