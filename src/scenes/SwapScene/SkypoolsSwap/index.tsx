import { FormattedMessage } from 'react-intl';

import { Button } from '../../../components/Button';
import { useSkypools } from '../../../modules/para-inch-react';

import { claim, claimNote, confirmed, container } from './styles';

export const SkypoolsSwap = ({
  destToken,
  srcToken,
  swapId,
}: {
  destToken: string;
  srcToken: string;
  swapId: string;
}) => {
  const { handleClaim } = useSkypools(swapId);

  return (
    <div css={container}>
      <div css={confirmed}>
        <FormattedMessage id="swap.deposit-confirmed" values={{ value: srcToken }} />
      </div>
      <div css={claim}>
        <div css={claimNote}>
          <FormattedMessage id="swap.claim" values={{ value: destToken }} />
        </div>

        <Button
          variant="primary"
          size="city"
          // Todo
          // disabled={}
          onClick={handleClaim ?? undefined}
        >
          <FormattedMessage id="swap.button.claim" />
        </Button>
      </div>
    </div>
  );
};
