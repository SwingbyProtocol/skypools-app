import { useEffect, useMemo } from 'react';

import { useSkybridgeSwapInfoLazyQuery } from '../../generated/skybridge-graphql';

export const useSkybridgeSwap = (skybridgeId: string) => {
  const [getSwaps, result] = useSkybridgeSwapInfoLazyQuery();

  useEffect(() => {
    if (!skybridgeId) return;

    getSwaps({
      variables: {
        id: skybridgeId,
      },
    });
  }, [getSwaps, skybridgeId]);

  useEffect(() => {
    if (
      !result.data ||
      ['COMPLETED', 'EXPIRED', 'REFUNDED'].includes(result.data.transaction.status)
    ) {
      return;
    }
    result.startPolling(60000);
    return () => result.stopPolling();
  }, [result]);

  return useMemo(() => {
    return {
      wbtcSrcAmount: result?.data?.transaction.receivingAmount ?? '0',
      status: result?.data?.transaction.status ?? 'WAITING',
    };
  }, [result]);
};
