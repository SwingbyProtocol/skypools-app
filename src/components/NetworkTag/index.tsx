import { useIntl } from 'react-intl';

import { isValidNetworkId, NetworkId } from '../../modules/onboard';

import { container, bsc, eth, goerli, bsct } from './styled';

export function NetworkTag(props: { network: number | null; className?: string }): JSX.Element;
export function NetworkTag(props: { network: NetworkId | null; className?: string }): JSX.Element;
export function NetworkTag({
  network,
  className,
}: {
  network: NetworkId | number | null;
  className?: string;
}): JSX.Element {
  const { formatMessage } = useIntl();
  return (
    <div
      css={[
        container,
        network === 1 && eth,
        network === 5 && goerli,
        network === 56 && bsc,
        network === 97 && bsct,
      ]}
      className={className}
      title={formatMessage({
        id: isValidNetworkId(network) ? `network.full.${network}` : 'network.invalid',
      })}
    >
      {isValidNetworkId(network) ? formatMessage({ id: `network.short.${network}` }) : '?'}
    </div>
  );
}
