import { useEffect } from 'react';

import { useSkybridgeSwapInfoLazyQuery } from '../../generated/skybridge-graphql';

import { useBtcDeposits } from './useBtcDeposits';

export const useUpdateBtcDeposit = (skybridgeId: string) => {
  const [getSwaps, result] = useSkybridgeSwapInfoLazyQuery();
  const { updateTx, depositTxs } = useBtcDeposits();

  useEffect(() => {
    if (!skybridgeId) return;

    getSwaps({
      variables: {
        id: skybridgeId,
      },
    });
  }, [getSwaps, skybridgeId]);

  useEffect(() => {
    if (!result.data || !skybridgeId) return;
    const filteredTx = depositTxs.filter((it) => it.hash === skybridgeId);
    const tx = filteredTx[0] ?? null;
    if (!tx) return;

    if (['COMPLETED', 'EXPIRED', 'REFUNDED'].includes(tx.status)) return;

    if (tx.status !== result.data.transaction.status) {
      updateTx({ status: result.data.transaction.status, hash: skybridgeId });
    }
    result.startPolling(60000);
    return () => result.stopPolling();
  }, [result, skybridgeId, depositTxs, updateTx]);
};
