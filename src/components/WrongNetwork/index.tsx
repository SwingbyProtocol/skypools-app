import { FormattedMessage } from 'react-intl';
// @ts-ignore
import { Network } from '@prisma/client';

import { useWalletConnection } from '../../modules/hooks/useWalletConnection';
import { Modal } from '../Modal';
import { Button } from '../Button';

import { buttonContainer, button, modalContainer } from './styles';

export const WrongNetwork = () => {
  const { connectedWallet, supportedNetwork, pushNetwork } = useWalletConnection();

  if (!connectedWallet) {
    return null;
  }

  if (supportedNetwork) {
    return null;
  }

  const onEthereumConnect = async () => {
    await pushNetwork(Network.ETHEREUM);
  };

  const onRopstenConnect = async () => {
    await pushNetwork(Network.ROPSTEN);
  };

  return (
    <Modal css={modalContainer} titleID="wallet.wrong-network">
      <div css={buttonContainer}>
        <FormattedMessage id="wallet.select.network" />
        <Button
          variant="secondary"
          size="street"
          shape="fit"
          css={button}
          onClick={onEthereumConnect}
        >
          <FormattedMessage id="wallet.connect-ethereum" />
        </Button>
        <Button
          variant="secondary"
          size="street"
          shape="fit"
          css={button}
          onClick={onRopstenConnect}
        >
          <FormattedMessage id="wallet.connect-ropsten" />
        </Button>
      </div>
    </Modal>
  );
};
