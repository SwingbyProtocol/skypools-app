import { useRouter } from 'next/router';
import { createContext, ReactNode, useState, useMemo, useCallback, useEffect } from 'react';
import { Big } from 'big.js';
import { stringifyUrl } from 'query-string';

import { formatQuoteError, ParaInchToken } from '../para-inch';
import { Network } from '../networks';
import { SwapQuoteQueryResult, useSwapQuoteLazyQuery } from '../../generated/skypools-graphql';
import { availableNetwork, minimumReceiveBtcAmount } from '../env';
import { useWalletConnection } from '../hooks/useWalletConnection';

export type ParaInchContextValue = {
  amount: string | null;
  fromToken: ParaInchToken | null;
  network: Network;
  slippage: string;
  setAmount: (amount: string | null) => void;
  setSlippage: (slippage: string) => void;
  setFromToken: (address: string) => void;
  setNetwork: (amount: Network) => void;
  setToToken: (address: string) => void;
  setToken: ({ from, to }: { from: string; to: string }) => void;
  unlinkSkybridgeSwap: () => void;
  tokens: ParaInchToken[];
  toToken: ParaInchToken | null;
  isAmountValid: boolean;
  swapQuote: NonNullable<SwapQuoteQueryResult['data']>['swapQuote'] | null;
  errorMsg: string;
};

export const ParaInchContext = createContext<ParaInchContextValue>({
  amount: null,
  fromToken: null,
  network: Network.ETHEREUM,
  slippage: '',
  setAmount: () => {},
  setSlippage: () => {},
  setFromToken: () => {},
  setToken: () => {},
  setNetwork: () => {},
  setToToken: () => {},
  unlinkSkybridgeSwap: () => {},
  tokens: [],
  toToken: null,
  isAmountValid: false,
  swapQuote: null,
  errorMsg: '',
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
  const { address } = useWalletConnection();

  const [amount, setAmount] = useState<string | null>(null);
  const [slippage, setSlippage] = useState<string>('1');
  const [fromToken, setFromTokenState] = useState<ParaInchToken | null>(valueProp.fromToken);
  const [toToken, setToTokenState] = useState<ParaInchToken | null>(valueProp.toToken);
  const [getSwapQuote, { data: swapQuoteData, error: quoteError }] = useSwapQuoteLazyQuery();
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const isSkypools = fromToken?.symbol === 'BTC' || toToken?.symbol === 'BTC';

    if (address && isSkypools && !availableNetwork.includes(valueProp.network)) {
      setErrorMsg('Currently, SkyPools supports Ropsten testnet only');
      return;
    }

    if (quoteError) {
      setErrorMsg(formatQuoteError(quoteError.message));
      return;
    }

    setErrorMsg('');
  }, [quoteError, address, valueProp.network, fromToken, toToken]);

  useEffect(() => {
    if (!swapQuoteData || toToken?.symbol !== 'BTC') return;

    if (minimumReceiveBtcAmount > Number(swapQuoteData.swapQuote.bestRoute.destTokenAmount)) {
      setErrorMsg(`Minimum receiving amount is ${minimumReceiveBtcAmount}BTC`);
    } else {
      setErrorMsg('');
    }
  }, [swapQuoteData, toToken]);

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

  const setToken = useCallback(
    ({ from, to }: { from: string; to: string }) => {
      const fromAddress = from.toLowerCase();
      const toAddress = to.toLowerCase();
      const fromToken = valueProp.tokens.find(
        ({ address }) => address.toLowerCase() === fromAddress,
      );
      if (!fromToken) {
        throw new Error(`Could not find token "${fromAddress}"`);
      }
      const toToken = valueProp.tokens.find(({ address }) => address.toLowerCase() === toAddress);
      if (!toToken) {
        throw new Error(`Could not find token "${toAddress}"`);
      }
      setFromTokenState(toToken);
      setToTokenState(fromToken);
      setAmount(null);

      push(
        stringifyUrl({
          url: `/swap/${valueProp.network.toLowerCase()}/${toToken?.address}/${fromToken.address}`,
          query: { skybridgeSwap },
        }),
        '',
        { shallow: true },
      );
    },
    [push, skybridgeSwap, valueProp.network, valueProp.tokens],
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
            if (!amount || amount === '0') return '1';
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
      slippage,
      setSlippage,
      setAmount,
      fromToken,
      toToken,
      setFromToken,
      setToToken,
      setToken,
      setNetwork,
      errorMsg,
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
      slippage,
      setSlippage,
      swapQuoteData,
      unlinkSkybridgeSwap,
      errorMsg,
      setToken,
    ],
  );

  return <ParaInchContext.Provider value={value}>{children}</ParaInchContext.Provider>;
};
