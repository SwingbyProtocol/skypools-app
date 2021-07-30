import { useRouter } from 'next/router';
import { createContext, ReactNode, useState, useMemo, useCallback, useEffect } from 'react';
import { Big } from 'big.js';
import { stringifyUrl } from 'query-string';

import type { ParaInchToken } from '../para-inch';
import { Network } from '../networks';
import { useOnboard } from '../onboard';
import { SwapQuoteMutationResult, useSwapQuoteMutation } from '../../generated/skypools-graphql';

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
  swapQuote: NonNullable<SwapQuoteMutationResult['data']>['swapQuote'] | null;
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
  const { address } = useOnboard();

  const [amount, setAmount] = useState<string | null>(null);
  const [fromToken, setFromTokenState] = useState<ParaInchToken | null>(valueParam.fromToken);
  const [toToken, setToTokenState] = useState<ParaInchToken | null>(valueParam.toToken);
  const [getSwapQuote, { data: swapQuoteData }] = useSwapQuoteMutation();

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
    if (!fromToken || !toToken) {
      return;
    }

    getSwapQuote({
      variables: {
        srcTokenAddress: fromToken.address,
        destTokenAddress: toToken.address,
        initiatorAddress: address ?? '0x3A9077DE17DF9630C50A9fdcbf11a96015f20B5A',
        network: valueParam.network,
        srcTokenAmount: (() => {
          try {
            if (!amount) return '1';
            return new Big(amount).toFixed();
          } catch (e) {
            return '1';
          }
        })(),
      },
    });
  }, [address, amount, fromToken, getSwapQuote, toToken, valueParam.network]);

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
      swapQuote: swapQuoteData?.swapQuote ?? null,
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
      swapQuoteData,
      unlinkSkybridgeSwap,
    ],
  );

  return <ParaInchContext.Provider value={value}>{children}</ParaInchContext.Provider>;
};
