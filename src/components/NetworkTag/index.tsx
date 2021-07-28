import { useIntl } from 'react-intl';

import { Network } from '../../modules/networks';

import { container, bsc, eth } from './styled';

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
      css={[
        container,
        network === Network.ETHEREUM && eth,
        // network === 5 && goerli,
        network === Network.BSC && bsc,
        // network === 97 && bsct,
      ]}
      className={className}
      title={formatMessage({
        id: network ? `network.full.${network}` : 'network.invalid',
      })}
    >
      {network ? formatMessage({ id: `network.short.${network}` }) : '?'}
    </div>
  );
};
