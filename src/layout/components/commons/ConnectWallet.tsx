import { FormattedMessage } from 'react-intl';
import React from 'react';

import { useWalletConnection } from '../../../modules/hooks/useWalletConnection';
import { ConnectionStatus } from '../../../components/ConnectionStatus';

import { ConnectButton } from './styled';

export const ConnectWallet = () => {
  const { address, onWalletConnect, onWalletDisconnect } = useWalletConnection();

  return (
    <>
      <ConnectButton variant={'small'} onClick={address ? onWalletDisconnect : onWalletConnect}>
        {address ? (
          <FormattedMessage id="wallet.disconnect" />
        ) : (
          <FormattedMessage id="wallet.connect" />
        )}
      </ConnectButton>
      <ConnectionStatus />
    </>
  );
};
