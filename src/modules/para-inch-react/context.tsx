import { useRouter } from 'next/router';
import { createContext, ReactNode, useState, useMemo, useCallback, useEffect } from 'react';
import { Big } from 'big.js';
import { stringifyUrl } from 'query-string';

import type { ParaInchToken, SwapQuote } from '../server__para-inch';
import { getSwapQuote } from '../server__para-inch';
import { Network, useOnboard } from '../onboard';
import { logger } from '../logger';

export type ParaInchContextValue = {
  amount: string | null;
  fromToken: ParaInchToken | null;
  network: Network;
  setAmount: (amount: string | null) => void;
  setFromToken: (address: string) => void;
  setNetwork: (amount: Network) => void;
  setToToken: (address: string) => void;
  unlinkSkybridgeSwap: () => void;
  tokens: ParaInchToken[];
  toToken: ParaInchToken | null;
  isAmountValid: boolean;
  swapQuote: SwapQuote | null;
};

export const ParaInchContext = createContext<ParaInchContextValue>({
  amount: null,
  fromToken: null,
  network: Network.ETHEREUM,
  setAmount: () => {},
  setFromToken: () => {},
  setNetwork: () => {},
  setToToken: () => {},
  unlinkSkybridgeSwap: () => {},
  tokens: [],
  toToken: null,
  isAmountValid: false,
  swapQuote: null,
});

export const ParaInchTokenProvider = ({
  value: valueParam,
  children,
}: {
  children?: ReactNode;
  value: Pick<ParaInchContextValue, 'fromToken' | 'network' | 'toToken' | 'tokens'>;
}) => {
  const {
    push,
    query: { skybridgeSwap },
  } = useRouter();
  const { wallet, address } = useOnboard();

  const [amount, setAmount] = useState<string | null>(null);
  const [fromToken, setFromTokenState] = useState<ParaInchToken | null>(valueParam.fromToken);
  const [toToken, setToTokenState] = useState<ParaInchToken | null>(valueParam.toToken);
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);

  const setFromToken = useCallback(
    (value: string) => {
      const token = valueParam.tokens.find(
        ({ address }) => address.toLowerCase() === value.toLowerCase(),
      );
      if (!token) {
        throw new Error(`Could not find token "${value}"`);
      }

      setFromTokenState(token);
      push(
        stringifyUrl({
          url: `/swap/${valueParam.network.toLowerCase()}/${token.address}/${toToken?.address}`,
          query: { skybridgeSwap },
        }),
        '',
        { shallow: true },
      );
    },
    [valueParam.tokens, push, toToken, valueParam.network, skybridgeSwap],
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
      push(
        stringifyUrl({
          url: `/swap/${valueParam.network.toLowerCase()}/${fromToken?.address}/${token.address}`,
          query: { skybridgeSwap },
        }),
        '',
        { shallow: true },
      );
    },
    [valueParam.tokens, push, fromToken, valueParam.network, skybridgeSwap],
  );

  const setNetwork = useCallback(
    (value: Network) => {
      push(
        stringifyUrl({
          url: `/swap/${value.toLowerCase()}/${fromToken?.address}/${toToken?.address}`,
          query: { skybridgeSwap },
        }),
      );
    },
    [push, fromToken, toToken, skybridgeSwap],
  );

  const unlinkSkybridgeSwap = useCallback(() => {
    push(
      stringifyUrl({
        url: `/swap/${valueParam.network.toLowerCase()}/${fromToken?.address}/${toToken?.address}`,
        query: { skybridgeSwap: undefined },
      }),
    );
  }, [push, valueParam.network, fromToken, toToken]);

  useEffect(() => {
    let cancelled = false;

    if (!fromToken || !toToken) {
      return;
    }

    const loadQuote = async () => {
      try {
        if (cancelled) return;

        setSwapQuote(null);
        const result = await getSwapQuote({
          fromToken,
          toToken,
          amount: amount ?? 1,
          network: valueParam.network,
          sourceAddress: address,
          walletProvider: wallet?.provider,
        });

        if (cancelled) return;
        logger.debug({ swapQuote: result }, 'Got a swap quote');
        setSwapQuote(result);
      } catch (err) {
        logger.error({ err }, 'Failed to load swap quote');
        setTimeout(loadQuote, 2500);
      }
    };

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [fromToken, toToken, valueParam?.network, amount, address, wallet?.provider]);

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
      swapQuote,
      unlinkSkybridgeSwap,
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
      swapQuote,
      unlinkSkybridgeSwap,
    ],
  );

  return <ParaInchContext.Provider value={value}>{children}</ParaInchContext.Provider>;
};
