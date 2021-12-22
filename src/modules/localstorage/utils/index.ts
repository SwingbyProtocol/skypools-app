import { PendingDeposit } from './../index';
export const LOCAL_STORAGE = {
  btcPendingDeposits: 'btc-pending-deposits',
};

const { btcPendingDeposits } = LOCAL_STORAGE;

export const getPendingDeposits = () => {
  const pendingTxs = localStorage.getItem(btcPendingDeposits);
  return pendingTxs ? JSON.parse(pendingTxs) : [];
};

export const addPendingDeposits = ({
  amount,
  hash,
  mode,
}: {
  amount: string;
  hash: string;
  mode: 'production' | 'test';
}): void => {
  const pendingTxs = getPendingDeposits();
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

export const updatePendingDeposits = (txs: PendingDeposit[]): void => {
  localStorage.setItem(btcPendingDeposits, JSON.stringify(txs));
  return;
};
