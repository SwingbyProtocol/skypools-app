import { useRouter } from 'next/router';
import { createContext, ReactNode, useState, useMemo, useCallback } from 'react';
import { Big } from 'big.js';

import type { ParaInchToken, SupportedNetworkId } from '../para-inch';

export type ParaInchContextValue = {
  amount: string | null;
  fromToken: ParaInchToken | null;
  network: SupportedNetworkId;
  setAmount: (amount: string | null) => void;
  setFromToken: (amount: string) => void;
  setNetwork: (amount: SupportedNetworkId) => void;
  setToToken: (amount: string) => void;
  tokens: ParaInchToken[];
  toToken: ParaInchToken | null;
  isAmountValid: boolean;
};

export const ParaInchContext = createContext<ParaInchContextValue>({
  amount: null,
  fromToken: null,
  network: 1,
  setAmount: () => {},
  setFromToken: () => {},
  setNetwork: () => {},
  setToToken: () => {},
  tokens: [],
  toToken: null,
  isAmountValid: false,
});

export const ParaInchTokenProvider = ({
  value: valueParam,
  children,
}: {
  children?: ReactNode;
  value: Omit<
    ParaInchContextValue,
    'amount' | 'setAmount' | 'setFromToken' | 'setNetwork' | 'setToToken' | 'isAmountValid'
  >;
}) => {
  const { push } = useRouter();

  const [amount, setAmount] = useState<string | null>(null);
  const [fromToken, setFromTokenState] = useState<ParaInchToken | null>(valueParam.fromToken);
  const [toToken, setToTokenState] = useState<ParaInchToken | null>(valueParam.toToken);

  const setFromToken = useCallback(
    (value: string) => {
      const token = valueParam.tokens.find(
        ({ address }) => address.toLowerCase() === value.toLowerCase(),
      );
      if (!token) {
        throw new Error(`Could not find token "${value}"`);
      }

      setFromTokenState(token);
      push(`/swap/${valueParam.network}/${token.address}/${toToken?.address}`, '', {
        shallow: true,
      });
    },
    [valueParam.tokens, push, toToken, valueParam.network],
  );

  const setToToken = useCallback(
    (value: string) => {
      const token = valueParam.tokens.find(
        ({ address }) => address.toLowerCase() === value.toLowerCase(),
      );
      if (!token) {
        throw new Error(`Could not find token "${value}"`);
      }

      setToTokenState(token);
      push(`/swap/${valueParam.network}/${fromToken?.address}/${token.address}`, '', {
        shallow: true,
      });
    },
    [valueParam.tokens, push, fromToken, valueParam.network],
  );

  const setNetwork = useCallback(
    (value: SupportedNetworkId) => {
      push(`/swap/${value}/${fromToken?.address}/${toToken?.address}`, '');
    },
    [push, fromToken, toToken],
  );

  const value = useMemo(
    () => ({
      network: valueParam.network,
      tokens: valueParam.tokens,
      amount,
      setAmount,
      fromToken,
      toToken,
      setFromToken,
      setToToken,
      setNetwork,
      isAmountValid: ((): boolean => {
        try {
          return !!amount && new Big(amount).gt(0);
        } catch (e) {
          return false;
        }
      })(),
    }),
    [
      valueParam.network,
      valueParam.tokens,
      amount,
      fromToken,
      toToken,
      setFromToken,
      setToToken,
      setNetwork,
    ],
  );

  return <ParaInchContext.Provider value={value}>{children}</ParaInchContext.Provider>;
};
