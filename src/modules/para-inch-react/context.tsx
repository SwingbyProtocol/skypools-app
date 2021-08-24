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
  value: valueProp,
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
  const [fromToken, setFromTokenState] = useState<ParaInchToken | null>(valueProp.fromToken);
  const [toToken, setToTokenState] = useState<ParaInchToken | null>(valueProp.toToken);
  const [getSwapQuote, { data: swapQuoteData }] = useSwapQuoteMutation();

  const setFromToken = useCallback(
    (newValue: string) => {
      const value = newValue.toLowerCase();
      if (fromToken?.address.toLowerCase() === value) {
        return;
      }

      const token = valueProp.tokens.find(({ address }) => address.toLowerCase() === value);
      if (!token) {
        throw new Error(`Could not find token "${value}"`);
      }

      setFromTokenState(token);
      push(
        stringifyUrl({
          url: `/swap/${valueProp.network.toLowerCase()}/${token.address}/${toToken?.address}`,
          query: { skybridgeSwap },
        }),
        '',
        { shallow: true },
      );
    },
    [valueProp.tokens, push, toToken, valueProp.network, skybridgeSwap, fromToken?.address],
  );

  const setToToken = useCallback(
    (newValue: string) => {
      const value = newValue.toLowerCase();
      if (toToken?.address.toLowerCase() === value) {
        return;
      }

      const token = valueProp.tokens.find(({ address }) => address.toLowerCase() === value);
      if (!token) {
        throw new Error(`Could not find token "${value}"`);
      }

      setToTokenState(token);
      push(
        stringifyUrl({
          url: `/swap/${valueProp.network.toLowerCase()}/${fromToken?.address}/${token.address}`,
          query: { skybridgeSwap },
        }),
        '',
        { shallow: true },
      );
    },
    [valueProp.tokens, push, fromToken, valueProp.network, skybridgeSwap, toToken?.address],
  );

  const setNetwork = useCallback(
    (newValue: Network) => {
      const value = newValue.toLowerCase();
      if (value === valueProp.network.toLowerCase()) {
        return;
      }

      push(
        stringifyUrl({
          url: `/swap/${value}/${fromToken?.address}/${toToken?.address}`,
          query: { skybridgeSwap },
        }),
      );
    },
    [push, fromToken, toToken, skybridgeSwap, valueProp.network],
  );

  const unlinkSkybridgeSwap = useCallback(() => {
    push(
      stringifyUrl({
        url: `/swap/${valueProp.network.toLowerCase()}/${fromToken?.address}/${toToken?.address}`,
        query: { skybridgeSwap: undefined },
      }),
    );
  }, [push, valueProp.network, fromToken, toToken]);

  useEffect(() => {
    if (!fromToken || !toToken) {
      return;
    }

    getSwapQuote({
      variables: {
        srcTokenAddress: fromToken.address,
        destTokenAddress: toToken.address,
        initiatorAddress: address ?? '0x3A9077DE17DF9630C50A9fdcbf11a96015f20B5A',
        network: valueProp.network,
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
  }, [address, amount, fromToken, getSwapQuote, toToken, valueProp.network]);

  const value = useMemo(
    () => ({
      network: valueProp.network,
      tokens: valueProp.tokens,
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
      valueProp.network,
      valueProp.tokens,
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
