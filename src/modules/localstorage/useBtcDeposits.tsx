import { useEffect, useMemo, useState, useCallback } from 'react';

import { updateBtcDeposits } from './utils';

import { getBtcDeposits, PendingDeposit } from './index';

export const useBtcDeposits = () => {
  const [depositTxs, setDepositTxs] = useState<PendingDeposit[] | []>([]);

  const updateTx = useCallback(({ status, hash }: { status: string; hash: string }) => {
    const txs = getBtcDeposits();

    const updatedTxs = txs.map((it: PendingDeposit) =>
      it.hash === hash ? { ...it, status } : { ...it },
    );
    setDepositTxs(updatedTxs);
    updateBtcDeposits(updatedTxs);
    return;
  }, []);

  const getTxs = useCallback(() => {
    const txs = getBtcDeposits();
    setDepositTxs(txs);
  }, []);

  useEffect(() => {
    getTxs();

    const interval = setInterval(() => {
      getTxs();
    }, 10000);

    return () => clearInterval(interval);
  }, [getTxs]);

  return useMemo(() => {
    return {
      updateTx,
      depositTxs,
    };
  }, [depositTxs, updateTx]);
};
