import { FormattedMessage } from 'react-intl';

import { shortenAddress } from '../../modules/short-address';
import { logger } from '../../modules/logger';
import { Button } from '../Button';
import { NetworkTag } from '../NetworkTag';
import { useOnboard } from '../../modules/onboard';
import { useHealthCheck } from '../../modules/1inch';

import { container, networkTag, walletWrapper, healthIndicator, healthy } from './styled';

export const ConnectWallet = ({ className }: { className?: string }) => {
  const { address, network, onboard } = useOnboard();
  const { isHealthy } = useHealthCheck();

  return (
    <div css={container} className={className}>
      <div css={walletWrapper}>
        <div css={[healthIndicator, isHealthy && healthy]} />
        {!!address && <NetworkTag css={networkTag} network={network} />}
        <Button
          variant="secondary"
          size="street"
          shape="fit"
          onClick={() => {
            try {
              if (address) {
                onboard?.walletReset();
                return;
              }

              onboard?.walletSelect();
            } catch (e) {
              logger.error(e);
            }
          }}
        >
          {address ? shortenAddress({ value: address }) : <FormattedMessage id="wallet.connect" />}
        </Button>
      </div>
    </div>
  );
};
