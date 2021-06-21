import { useRouter } from 'next/router';
import { useCallback, useContext } from 'react';

import type { SupportedNetworkId } from '../para-inch';

import { ParaInchContext } from './context';

export { ParaInchTokenProvider } from './context';

export type { ParaInchContextValue } from './context';

export const useParaInch = () => {
  const { push } = useRouter();
  const context = useContext(ParaInchContext);
  return {
    ...context,
    setFromToken: useCallback(
      (value: string) => push(`/swap/${context.network}/${value}/${context.toToken?.address}`, ''),
      [push, context.toToken?.address, context.network],
    ),
    setToToken: useCallback(
      (value: string) =>
        push(`/swap/${context.network}/${context.fromToken?.address}/${value}`, ''),
      [push, context.fromToken?.address, context.network],
    ),
    setNetwork: useCallback(
      (value: SupportedNetworkId) =>
        push(`/swap/${value}/${context.fromToken?.address}/${context.toToken?.address}`, ''),
      [push, context.fromToken?.address, context.toToken?.address],
    ),
  };
};
