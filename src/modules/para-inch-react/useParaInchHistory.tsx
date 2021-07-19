import { useState, useEffect, useMemo } from 'react';
import Web3 from 'web3';
import type { PromiseValue } from 'type-fest';

import { logger } from '../logger';
import { useOnboard } from '../onboard';
import { getLatestTransactions, getSpender, ParaInchToken } from '../para-inch';

import { useParaInch } from './useParaInch';

type TransactionItem = Omit<
  PromiseValue<ReturnType<typeof getLatestTransactions>>[number],
  'fromTokenAddress' | 'toTokenAddress'
> & {
  fromToken: ParaInchToken | null;
  toToken: ParaInchToken | null;
};

type PendingItem = Omit<TransactionItem, 'at' | 'blockNumber' | 'status'> & {
  at: null;
  blockNumber: string | null;
  status: 'pending';
};

export type ParaInchHistoryItem = TransactionItem | PendingItem;

export const useParaInchHistory = () => {
  const { address, wallet } = useOnboard();
  const { network, tokens } = useParaInch();
  const [spender, setSpender] = useState<string | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<PendingItem[]>([]);
  const [latestTransactions, setLatestTransactions] = useState<TransactionItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        if (cancelled) return;

        const spender = await getSpender({ network });
        if (cancelled) return;

        setSpender(spender);
      } catch (err) {
        logger.warn({ err }, 'Failed to get spender');
        setTimeout(check, 15000);
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, [network]);

  useEffect(() => {
    const walletProvider = wallet?.provider;
    if (!walletProvider || !spender) return;

    let cancelled = false;

    const check = async () => {
      try {
        if (cancelled) return;

        const web3 = new Web3(walletProvider);
        const transactions = (await web3.eth.getPendingTransactions())
          .map(
            (it): PendingItem => ({
              hash: it.hash,
              at: null,
              blockNumber: it.blockNumber ? `${it.blockNumber}` : null,
              from: it.from,
              to: `${it.to}`,
              status: 'pending',
              fromAmount: null,
              toAmount: null,
              fromToken: null,
              toToken: null,
            }),
          )
          .filter((it) => it.to.toLowerCase() === spender);
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
  }, [spender, wallet?.provider]);

  useEffect(() => {
    if (!address || !spender) return;

    let cancelled = false;

    const check = async () => {
      try {
        if (cancelled) return;

        const transactions = (await getLatestTransactions({ address, network, spender })).map(
          (it): TransactionItem => ({
            ...it,
            fromToken:
              tokens.find(({ address }) => address.toLowerCase() === it.fromTokenAddress) ?? null,
            toToken:
              tokens.find(({ address }) => address.toLowerCase() === it.toTokenAddress) ?? null,
          }),
        );

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
  }, [address, network, spender, tokens]);

  return {
    pendingTransactions,
    latestTransactions,
    allTransactions: useMemo(
      () => [...pendingTransactions, ...latestTransactions],
      [pendingTransactions, latestTransactions],
    ),
  };
};
