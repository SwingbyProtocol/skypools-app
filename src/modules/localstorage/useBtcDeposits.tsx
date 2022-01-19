import { useEffect, useMemo, useState, useCallback } from 'react';

import { useOnboard } from '../onboard';

import { updateBtcDeposits } from './utils';

import { getBtcDeposits, PendingDeposit } from './index';

export const useBtcDeposits = () => {
  const [depositTxs, setDepositTxs] = useState<PendingDeposit[] | []>([]);
  const { network } = useOnboard();
  const bridge = network === 'BSC' ? 'btc_bep20' : 'btc_erc';

  const updateTx = useCallback(
    ({ status, hash }: { status: string; hash: string }) => {
      const txs = getBtcDeposits();

      const updatedTxs = txs
        .map((it: PendingDeposit) => (it.hash === hash ? { ...it, status } : { ...it }))
        .filter((it: PendingDeposit) => it.bridge === bridge);
      setDepositTxs(updatedTxs);
      updateBtcDeposits(updatedTxs);
      return;
    },
    [bridge],
  );

  const getTxs = useCallback(() => {
    const txs = getBtcDeposits();
    const updatedTxs = txs.filter((it: PendingDeposit) => it.bridge === bridge);
    setDepositTxs(updatedTxs);
  }, [bridge]);

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
