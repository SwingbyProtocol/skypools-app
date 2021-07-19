import { FormattedMessage } from 'react-intl';

import { Icon } from '../../../../../components/Icon';
import { Loading } from '../../../../../components/Loading';
import { TransactionStatus } from '../../../../../generated/graphql';
import { useParaInch } from '../../../../../modules/para-inch-react';
import { shortenAddress } from '../../../../../modules/short-address';
import { useSkybridgeSwap } from '../useSkybridgeSwap';

import {
  container,
  statusCompleted,
  loading as loadingStyles,
  content,
  statusFailed,
  unlink as unlinkStyles,
} from './styles';

export const SkybridgeSwapBanner = ({ className }: { className?: string }) => {
  const { unlinkSkybridgeSwap } = useParaInch();
  const { data, loading, swapId, isValid } = useSkybridgeSwap();

  const hasSwapFailed: boolean =
    !!data &&
    [
      TransactionStatus.SendingRefund,
      TransactionStatus.SigningRefund,
      TransactionStatus.Expired,
      TransactionStatus.Refunded,
    ].includes(data.transaction.status);

  if (!swapId) {
    return <></>;
  }

  return (
    <div
      css={[
        container,
        data?.transaction.status === TransactionStatus.Completed && statusCompleted,
        (hasSwapFailed || !isValid) && statusFailed,
      ]}
      className={className}
    >
      {loading && <Loading css={loadingStyles} />}
      {!!data && (
        <div css={content}>
          <FormattedMessage
            id={
              !isValid
                ? 'widget.skybridge.invalid'
                : hasSwapFailed
                ? 'widget.skybridge.failed'
                : data.transaction.status === TransactionStatus.Completed
                ? 'widget.skybridge.completed'
                : 'widget.skybridge.waiting'
            }
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
        </div>
      )}
      {!loading && (
        <button css={unlinkStyles} onClick={unlinkSkybridgeSwap}>
          <Icon.Cross />
        </button>
      )}
    </div>
  );
};
