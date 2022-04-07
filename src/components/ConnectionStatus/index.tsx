import { ReactElement } from 'react';

import { NetworkTag } from '../NetworkTag';
import { networkTag } from '../ConnectWallet/styled';
import { shortenAddress } from '../../modules/short-address';
import { useWalletConnection } from '../../modules/hooks/useWalletConnection';

export const ConnectionStatus = (): ReactElement | null => {
  const { address, network, defaultNetwork } = useWalletConnection();

  return (
    <div>
      <NetworkTag css={networkTag} network={network ?? defaultNetwork} />
      {address ? shortenAddress({ value: address }) : null}
    </div>
  );
};
