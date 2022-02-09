import { LOCAL_STORAGE } from '../../env';

import { PendingDeposit } from './../index';

const { btcPendingDeposits } = LOCAL_STORAGE;

export const getBtcDeposits = () => {
  const pendingTxs = localStorage.getItem(btcPendingDeposits);
  return pendingTxs ? JSON.parse(pendingTxs) : [];
};

export const addBtcDeposits = ({
  amount,
  hash,
  mode,
}: {
  amount: string;
  hash: string;
  mode: 'production' | 'test';
}): void => {
  const pendingTxs = getBtcDeposits();
  const data = {
    time: Math.floor(Date.now() / 1000),
    status: 'WAITING',
    amount,
    hash,
    mode,
  };
  pendingTxs.unshift(data);
  localStorage.setItem(btcPendingDeposits, JSON.stringify(pendingTxs.slice(0, 25)));
  return;
};

export const updateBtcDeposits = (txs: PendingDeposit[]): void => {
  localStorage.setItem(btcPendingDeposits, JSON.stringify(txs));
  return;
};
