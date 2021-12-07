import { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { validate } from 'bitcoin-address-validation';

import { Button } from '../../../components/Button';
import { TextInput } from '../../../components/TextInput';
import { useSkypools, useSkypoolsDepositBalance } from '../../../modules/para-inch-react';

import {
  address,
  claim,
  confirmed,
  container,
  details,
  labelAddress,
  row,
  invalidAddressFormat,
  buttons,
} from './styles';

export const SkypoolsSwap = ({
  destToken,
  srcToken,
  swapId,
}: {
  destToken: string;
  srcToken: string;
  swapId: string;
}) => {
  // Todo: Get data from slippage UI
  const { handleClaim, minAmount, isBtcToToken, btcAddress, setBtcAddress, swapSrc, status } =
    useSkypools({
      swapId,
      slippage: '1',
    });

  const { depositBalance, handleWithdraw } = useSkypoolsDepositBalance(swapId);

  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);

  const isDeposited = Number(depositBalance.balance) >= Number(swapSrc.amount);

  const spProgress =
    status === 'COMPLETED' ? 'completed' : isDeposited ? 'ready-to-claim' : 'confirming-deposit-tx';

  const isDisabledClaim = isBtcToToken
    ? !isDeposited
    : !isValidAddress || !isDeposited || spProgress === 'completed';

  return (
    <div css={container}>
      <div css={confirmed}>
        <FormattedMessage id={`swap.progress.${spProgress}`} />
      </div>
      {!isBtcToToken && (
        <div css={address}>
          <div css={labelAddress}>
            <FormattedMessage id="btc-destination-address" />
          </div>
          <TextInput
            size="city"
            value={btcAddress ?? ''}
            onChange={(evt) => {
              setBtcAddress(evt.target.value);
              if (validate(evt.target.value)) {
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
      <div css={claim}>
        <div css={buttons}>
          <Button
            variant="primary"
            size="city"
            disabled={isDisabledClaim}
            onClick={handleClaim ?? undefined}
          >
            <FormattedMessage id="swap.claim" values={{ value: destToken }} />
          </Button>
          <Button
            variant="secondary"
            size="city"
            disabled={!Number(depositBalance.balance)}
            onClick={handleWithdraw ?? undefined}
          >
            <FormattedMessage id="swap.withdraw" values={{ value: swapSrc.token }} />
          </Button>
        </div>
      </div>
      <div css={details}>
        <div css={row}>
          <div>
            <FormattedMessage id="swap.total-deposited-balance" />
          </div>
          <div>
            {depositBalance.balance} {depositBalance.token}
          </div>
        </div>
        <div css={row}>
          <div>
            <FormattedMessage id="swap.swap-src-amount" />
          </div>
          <div>
            <FormattedMessage
              id="token-amount"
              values={{
                amount: (
                  <FormattedNumber value={Number(swapSrc.amount)} maximumFractionDigits={8} />
                ),
                token: swapSrc.token,
              }}
            />
          </div>
        </div>
        <div css={row}>
          <div>
            <FormattedMessage id="swap.min-receiving-amount" />
          </div>
          <div>
            <FormattedMessage
              id="token-amount"
              values={{
                amount: (
                  <FormattedNumber value={Number(minAmount.amount)} maximumFractionDigits={8} />
                ),
                token: minAmount.token,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
