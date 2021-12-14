import { useEffect, useMemo, useState } from 'react';

import { useSkybridgeSwapInfoLazyQuery } from '../../generated/skybridge-graphql';

export const useSkybridgeSwap = (skybridgeId: string) => {
  const [wbtcSrcAmount, setWbtcSrcAmount] = useState<string>('0');
  const [status, setStatus] = useState<string>('WAITING');
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
    if (!result.data) return;

    result.startPolling(60000);
    setStatus(result.data.transaction.status);
    setWbtcSrcAmount(result.data.transaction.receivingAmount);

    if (status === 'COMPLETED') {
      result.stopPolling();
    }
  }, [result, status]);

  return useMemo(() => {
    return {
      wbtcSrcAmount,
      status,
    };
  }, [wbtcSrcAmount, status]);
};
