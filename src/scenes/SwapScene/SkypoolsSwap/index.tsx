import { FormattedMessage, FormattedNumber } from 'react-intl';

import { Button } from '../../../components/Button';
import { useSkypools, useSkypoolsDepositBalance } from '../../../modules/para-inch-react';

import { claim, confirmed, container, details, row } from './styles';

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
  const { handleClaim, wbtcSrcAmount, minAmount } = useSkypools({ swapId, slippage: '1' });
  const { depositBalance } = useSkypoolsDepositBalance(swapId);

  return (
    <div css={container}>
      <div css={confirmed}>
        <FormattedMessage id="swap.deposit-confirmed" values={{ value: srcToken }} />
      </div>
      <div css={claim}>
        <Button
          variant="primary"
          size="city"
          disabled={Number(wbtcSrcAmount) > Number(depositBalance.balance)}
          onClick={handleClaim ?? undefined}
        >
          <FormattedMessage id="swap.claim" values={{ value: destToken }} />
        </Button>
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
                amount: <FormattedNumber value={Number(wbtcSrcAmount)} maximumFractionDigits={8} />,
                token: 'WBTC',
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
