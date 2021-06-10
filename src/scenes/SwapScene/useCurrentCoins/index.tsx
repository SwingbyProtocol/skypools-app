import { useRouter } from 'next/router';
import { createContext, useCallback, useContext } from 'react';

const Context = createContext({ fromCoin: null as string | null, toCoin: null as string | null });

export const CurrentCoinsProvider = Context.Provider;

export const useCurrentCoins = () => {
  const { push } = useRouter();
  const { fromCoin, toCoin } = useContext(Context);

  return {
    fromCoin,
    toCoin,
    setFromCoin: useCallback(
      (value: string) => push(`/swap/${value}/${toCoin}`, ''),
      [push, toCoin],
    ),
    setToCoin: useCallback(
      (value: string) => push(`/swap/${fromCoin}/${value}`, ''),
      [push, fromCoin],
    ),
  };
};
