import { FormattedMessage } from 'react-intl';

import { logger } from '../../modules/logger';
import { useOnboard } from '../../modules/onboard';
import { Button } from '../Button';

export const ConnectWalletButton = ({ className }: { className?: string }) => {
  const { address, onboard } = useOnboard();

  return (
    <Button
      variant="primary"
      size="city"
      shape="fit"
      onClick={() => {
        try {
          onboard?.walletSelect();
        } catch (err) {
          logger.error({ err });
        }
      }}
      title={address ?? undefined}
    >
      <FormattedMessage id="wallet.connect-wallet" />
    </Button>
  );
};
