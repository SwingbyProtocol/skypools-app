import { FormattedMessage } from 'react-intl';

import { Loading } from '../../../../../components/Loading';
import { TransactionStatus } from '../../../../../generated/graphql';
import { shortenAddress } from '../../../../../modules/short-address';
import { useSkybridgeSwap } from '../useSkybridgeSwap';

import { container, statusCompleted, loading as loadingStyles, content } from './styles';

export const SkybridgeSwapBanner = ({ className }: { className?: string }) => {
  const { data, loading, swapId } = useSkybridgeSwap();

  if (!swapId) {
    return <></>;
  }

  return (
    <div
      css={[container, data?.transaction.status === TransactionStatus.Completed && statusCompleted]}
      className={className}
    >
      {loading && <Loading css={loadingStyles} />}
      {!!data && (
        <div css={content}>
          {data.transaction.status !== TransactionStatus.Completed ? (
            <FormattedMessage
              id="widget.skybridge.waiting"
              values={{
                status: data.transaction.status,
                swap: (
                  <a
                    href={`https://widget.skybridge.exchange/production/swap/${data.transaction.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={data.transaction.id}
                  >
                    {shortenAddress({ value: data.transaction.id })}
                  </a>
                ),
              }}
            />
          ) : (
            <FormattedMessage
              id="widget.skybridge.completed"
              values={{
                swap: (
                  <a
                    href={`https://widget.skybridge.exchange/production/swap/${data.transaction.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={data.transaction.id}
                  >
                    {shortenAddress({ value: data.transaction.id })}
                  </a>
                ),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
