import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { TransactionStatus, useSkybridgeSwapInfoLazyQuery } from '../../../../generated/graphql';

export const useSkybridgeSwap = () => {
  const { query } = useRouter();
  const swapId = (() => {
    const value = query.skybridgeSwap;
    if (typeof value !== 'string' || !value) {
      return null;
    }

    return value;
  })();

  const [getSwapInfo, { data, loading, stopPolling, startPolling }] =
    useSkybridgeSwapInfoLazyQuery();

  useEffect(() => {
    if (!swapId) return;
    getSwapInfo({ variables: { id: swapId } });
  }, [getSwapInfo, swapId]);

  useEffect(() => {
    if (data?.transaction.status !== TransactionStatus.Completed) {
      startPolling?.(15000);
    }

    return () => {
      stopPolling?.();
    };
  }, [data, stopPolling, startPolling]);

  return { data, loading, swapId };
};
