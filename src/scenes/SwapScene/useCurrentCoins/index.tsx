import { useRouter } from 'next/router';
import { useCallback } from 'react';

export const useCurrentCoins = () => {
  const {
    push,
    query: { fromCoin, toCoin },
  } = useRouter();

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
