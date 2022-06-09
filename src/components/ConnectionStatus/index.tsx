import { ReactElement } from 'react';

import { NetworkTag } from '../NetworkTag';
import { addressStyle, networkTag } from '../ConnectWallet/styled';
import { shortenAddress } from '../../modules/short-address';
import { useWalletConnection } from '../../modules/hooks/useWalletConnection';

export const ConnectionStatus = (): ReactElement | null => {
  const { address, network, defaultNetwork } = useWalletConnection();

  return (
    <div>
      <NetworkTag css={networkTag} network={network ?? defaultNetwork} />
      {address ? <span css={addressStyle}>{shortenAddress({ value: address })}</span> : null}
    </div>
  );
};
