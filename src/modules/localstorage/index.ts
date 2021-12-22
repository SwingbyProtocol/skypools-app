export { addPendingDeposits, getPendingDeposits, updatePendingDeposits } from './utils';

export { useBtcDeposits } from './useBtcDeposits';

export { useUpdateDeposits } from './useUpdateDeposits';

export interface PendingDeposit {
  amount: string;
  hash: string;
  status: string;
  time: number;
  mode: 'test' | 'production';
}
