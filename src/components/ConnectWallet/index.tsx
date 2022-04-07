import { FormattedMessage } from 'react-intl';

import { Button } from '../Button';
import { useWalletConnection } from '../../modules/hooks/useWalletConnection';

import { container, walletWrapper } from './styled';

export const ConnectWallet = ({ className }: { className?: string }) => {
  const { address, onWalletConnect, onWalletDisconnect } = useWalletConnection();

  return (
    <div css={container} className={className}>
      <div css={walletWrapper}>
        <Button
          variant="secondary"
          size="street"
          shape="fit"
          onClick={address ? onWalletDisconnect : onWalletConnect}
        >
          {address ? (
            <FormattedMessage id="wallet.disconnect" />
          ) : (
            <FormattedMessage id="wallet.connect" />
          )}
        </Button>
      </div>
    </div>
  );
};
