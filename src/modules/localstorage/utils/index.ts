import { SkybridgeBridge } from '@swingby-protocol/sdk';

import { PendingDeposit } from './../index';
export const LOCAL_STORAGE = {
  btcPendingDeposits: 'btc-pending-deposits',
};

const { btcPendingDeposits } = LOCAL_STORAGE;

export const getBtcDeposits = () => {
  const pendingTxs = localStorage.getItem(btcPendingDeposits);
  return pendingTxs ? JSON.parse(pendingTxs) : [];
};

export const addBtcDeposits = ({
  amount,
  hash,
  mode,
  bridge,
}: {
  amount: string;
  hash: string;
  mode: 'production' | 'test';
  bridge: SkybridgeBridge;
}): void => {
  const pendingTxs = getBtcDeposits();
  const data = {
    time: Math.floor(Date.now() / 1000),
    status: 'WAITING',
    amount,
    hash,
    mode,
    bridge,
  };
  pendingTxs.unshift(data);
  localStorage.setItem(btcPendingDeposits, JSON.stringify(pendingTxs.slice(0, 25)));
  return;
};

export const updateBtcDeposits = (txs: PendingDeposit[]): void => {
  localStorage.setItem(btcPendingDeposits, JSON.stringify(txs));
  return;
};
