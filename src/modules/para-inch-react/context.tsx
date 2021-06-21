import { createContext, ReactNode } from 'react';

import type { ParaInchToken, SupportedNetworkId } from '../para-inch';

export type ParaInchContextValue = {
  fromToken: ParaInchToken | null;
  toToken: ParaInchToken | null;
  tokens: ParaInchToken[];
  network: SupportedNetworkId;
};

export const ParaInchContext = createContext<ParaInchContextValue>({
  fromToken: null,
  toToken: null,
  tokens: [],
  network: 1,
});

export const ParaInchTokenProvider = ({
  value,
  children,
}: {
  children?: ReactNode;
  value: ParaInchContextValue;
}) => <ParaInchContext.Provider value={value}>{children}</ParaInchContext.Provider>;
