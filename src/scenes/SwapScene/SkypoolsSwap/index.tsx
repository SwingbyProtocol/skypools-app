import { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Network, validate } from 'bitcoin-address-validation';

import { Button } from '../../../components/Button';
import { TextInput } from '../../../components/TextInput';
import { useSkypools, useSkypoolsDeposit } from '../../../modules/para-inch-react';
import { SkypoolsSlippage } from '../SkypoolsSlippage';
import { useOnboard } from '../../../modules/onboard';

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
  shortage,
  bottom,
} from './styles';

export const SkypoolsSwap = ({ destToken, swapId }: { destToken: string; swapId: string }) => {
  const [slippage, setSlippage] = useState<string>('1');
  const { network } = useOnboard();
  const {
    handleClaim,
    minAmount,
    isBtcToToken,
    btcAddress,
    setBtcAddress,
    swapSrc,
    status,
    isFloatShortage,
  } = useSkypools({
    swapId,
    slippage,
  });
  const { depositBalance, handleWithdraw } = useSkypoolsDeposit(swapId);

  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);

  const isDeposited = Number(depositBalance.balance) >= Number(swapSrc.amount);

  const btcNetwork = network === 'ROPSTEN' ? Network.testnet : Network.mainnet;

  const spProgress =
    status === 'COMPLETED' ? 'completed' : isDeposited ? 'ready-to-claim' : 'confirming-deposit-tx';

  const isDisabledClaim =
    !isDeposited || isFloatShortage || spProgress === 'completed' || isNaN(Number(slippage));

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
      <div css={claim}>
        <div css={buttons}>
          <Button
            variant="primary"
            size="city"
            disabled={isBtcToToken ? isDisabledClaim : isDisabledClaim || !isValidAddress}
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
      {isFloatShortage && (
        <div css={shortage}>
          <div>
            <FormattedMessage id="floats.insufficient" values={{ value: destToken }} />
          </div>
          <div>
            <FormattedMessage id="floats.withdraw" values={{ value: swapSrc.token }} />
          </div>
        </div>
      )}
      <div css={bottom}>
        <div css={details}>
          <div css={row}>
            <div>
              <FormattedMessage id="swap.total-deposited-balance" />
            </div>
            <div>
              <FormattedMessage
                id="token-amount"
                values={{
                  amount: (
                    <FormattedNumber
                      value={Number(depositBalance.balance)}
                      maximumFractionDigits={8}
                    />
                  ),
                  token: depositBalance.token,
                }}
              />
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
        <SkypoolsSlippage slippage={slippage} setSlippage={setSlippage} />
      </div>
    </div>
  );
};
