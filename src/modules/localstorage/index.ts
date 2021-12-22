export { addBtcDeposits, getBtcDeposits, updateBtcDeposits } from './utils';

export { useBtcDeposits } from './useBtcDeposits';

export { useUpdateBtcDeposit } from './useUpdateBtcDeposit';

export interface PendingDeposit {
  amount: string;
  hash: string;
  status: string;
  time: number;
  mode: 'test' | 'production';
}
