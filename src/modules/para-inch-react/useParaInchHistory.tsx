import { useState, useEffect } from 'react';
import Web3 from 'web3';
import type { Transaction } from 'web3-eth';
import type { PromiseValue } from 'type-fest';

import { logger } from '../logger';
import { useOnboard } from '../onboard';
import { getLatestTransactions } from '../para-inch';

import { useParaInch } from './useParaInch';

export type ParaInchHistoryItem = PromiseValue<ReturnType<typeof getLatestTransactions>>[number];

export const useParaInchHistory = () => {
  const { address, wallet } = useOnboard();
  const { network } = useParaInch();
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [latestTransactions, setLatestTransactions] = useState<ParaInchHistoryItem[]>([]);

  useEffect(() => {
    const walletProvider = wallet?.provider;
    if (!walletProvider) return;

    let cancelled = false;

    const check = async () => {
      try {
        if (cancelled) return;

        const web3 = new Web3(walletProvider);
        const transactions = await web3.eth.getPendingTransactions();
        if (cancelled) return;

        setPendingTransactions((old) => {
          if (old.length !== transactions.length) {
            return transactions;
          }

          if (!transactions.every(({ hash }) => old.find((it) => it.hash === hash))) {
            return transactions;
          }

          return old;
        });

        setTimeout(check, 60000);
      } catch (err) {
        logger.warn({ err }, 'Failed to get pending transactions');
        setTimeout(check, 15000);
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [wallet?.provider]);

  useEffect(() => {
    if (!address) return;

    let cancelled = false;

    const check = async () => {
      try {
        if (cancelled) return;

        const transactions = await getLatestTransactions({ address, network });
        if (cancelled) return;

        setLatestTransactions((old) => {
          if (old.length !== transactions.length) {
            return transactions;
          }

          if (!transactions.every(({ hash }) => old.find((it) => it.hash === hash))) {
            return transactions;
          }

          return old;
        });

        setTimeout(check, 60000);
      } catch (err) {
        logger.warn({ err }, 'Failed to get latest transactions');
        setTimeout(check, 15000);
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [address, network]);

  return { pendingTransactions, latestTransactions };
};
