import { FormattedMessage } from 'react-intl';

import { logger } from '../../modules/logger';
import { useOnboard } from '../../modules/onboard';
import { Button } from '../Button';

export const ConnectWalletButton = () => {
  const { onboard } = useOnboard();

  return (
    <Button
      variant="primary"
      size="city"
      shape="fit"
      onClick={() => {
        try {
          (async () => {
            if (!onboard) {
              throw Error('cannot detect onboard instance');
            }
            await onboard.walletSelect();
          })();
        } catch (err) {
          logger.error({ err });
        }
      }}
    >
      <FormattedMessage id="wallet.connect-wallet" />
    </Button>
  );
};
