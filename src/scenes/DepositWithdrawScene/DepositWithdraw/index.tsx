import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

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
} from './styles';

export const DepositWithdraw = () => {
  const { tokens } = useTokens();
  const [fromToken, setFromToken] = useState<CoinInfo>(tokens[0]);
  const { address } = useOnboard();
  const {
    handleWithdraw,
    handleDeposit,
    depositedBalance,
    amount,
    setAmount,
    approve,
    isApprovalNeeded,
  } = useDepositWithdraw(fromToken);
  const { pathname } = useRouter();
  const isDeposit = pathname.includes('/deposit');
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
    Number(amount) > Number(depositedBalance.balance) || Number(amount) === 0;

  return (
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
            </div>
            <TextInput
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
                    value={Number(depositedBalance.balance)}
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
      </div>
      {(fromToken.symbol === 'BTC' || skybridgeId) && depositTxs.length > 0 && (
        <div css={historyContainer}>
          <div css={historyBox}>
            <BtcDeposit css={historyCard} />
          </div>
        </div>
      )}
    </div>
  );
};
