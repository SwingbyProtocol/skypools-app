import { useIntl } from 'react-intl';

import { Network } from '../../modules/networks';

import { container, eth, ropsten } from './styled';

export const NetworkTag = ({
  network,
  className,
}: {
  network: Network | null;
  className?: string;
}): JSX.Element => {
  const { formatMessage } = useIntl();
  return (
    <div
      css={[container, network === Network.ETHEREUM && eth, network === Network.ROPSTEN && ropsten]}
      className={className}
      title={formatMessage({
        id: network ? `network.full.${network}` : 'network.invalid',
      })}
    >
      {network ? formatMessage({ id: `network.full.${network}` }) : '?'}
    </div>
  );
};
