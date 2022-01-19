import { useCallback, useEffect } from 'react';

import { useOnboard } from '../onboard';
import { getSkybridgeTx } from '../skybridge';

import { useBtcDeposits } from './useBtcDeposits';

export const useUpdateBtcDeposit = (skybridgeId: string) => {
  const { updateTx, depositTxs } = useBtcDeposits();
  const { network } = useOnboard();

  const updateTxStatus = useCallback(async () => {
    if (!skybridgeId || !network) return;
    const filteredTxs = depositTxs.filter((it) => it.hash === skybridgeId);
    const filteredTx = filteredTxs[0];
    const tx = await getSkybridgeTx({ network, hash: skybridgeId });
    if (!tx || !filteredTx) return;

    if (['COMPLETED', 'EXPIRED', 'REFUNDED'].includes(filteredTx.status)) return;

    if (tx.status !== filteredTx.status) {
      updateTx({ status: tx.status, hash: skybridgeId });
    }
  }, [updateTx, depositTxs, network, skybridgeId]);

  useEffect(() => {
    updateTxStatus();

    const interval = setInterval(() => {
      updateTxStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, [updateTxStatus]);
};
