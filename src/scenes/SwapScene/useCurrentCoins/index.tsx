import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

import { useTokens } from '../../../modules/1inch';

export const useCurrentCoins = () => {
  const { tokens } = useTokens();
  const {
    push,
    query: { fromCoin: fromCoinParam, toCoin: toCoinParam },
  } = useRouter();

  const fromCoin = useMemo(
    () =>
      tokens.find(
        ({ address }) =>
          typeof fromCoinParam === 'string' &&
          address.toLowerCase() === fromCoinParam.toLowerCase(),
      ) ?? null,
    [tokens, fromCoinParam],
  );

  const toCoin = useMemo(() => {
    const result =
      tokens.find(
        ({ address }) =>
          typeof toCoinParam === 'string' && address.toLowerCase() === toCoinParam.toLowerCase(),
      ) ?? null;

    if (result === fromCoin) {
      return null;
    }

    return result;
  }, [tokens, toCoinParam, fromCoin]);

  return {
    fromCoin,
    toCoin,
    setFromCoin: useCallback(
      (value: string) => push(`/swap/${value}/${toCoin}`, '', { shallow: true }),
      [push, toCoin],
    ),
    setToCoin: useCallback(
      (value: string) => push(`/swap/${fromCoin}/${value}`, '', { shallow: true }),
      [push, fromCoin],
    ),
  };
};
