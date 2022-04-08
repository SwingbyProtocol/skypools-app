import { FormattedMessage } from 'react-intl';

import { Button } from '../Button';
import { useWalletConnection } from '../../modules/hooks/useWalletConnection';

export const ConnectWalletButton = () => {
  const { onWalletConnect } = useWalletConnection();

  return (
    <Button variant="primary" size="city" shape="fit" onClick={() => onWalletConnect()}>
      <FormattedMessage id="wallet.connect-wallet" />
    </Button>
  );
};
