import { useEffect, useMemo } from 'react';

import { CoinInfo } from '../../components/CoinInput';
import { useTokensLazyQuery, Network } from '../../generated/skypools-graphql';
import { useOnboard } from '../onboard';

const initialState: CoinInfo[] = [
  {
    id: '',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    logoUri: 'https://img.paraswap.network/ETH.png',
    network: Network.ETHEREUM,
    symbol: 'ETH',
  },
];

export const useTokens = (): { tokens: CoinInfo[] } => {
  const { network } = useOnboard();
  const [fetchTokens, { data: newData, previousData }] = useTokensLazyQuery();

  useEffect(() => {
    if (!network) return;
    fetchTokens({ variables: { where: { network: { equals: network } } } });
  }, [fetchTokens, network]);

  return useMemo(
    () => ({
      tokens: (newData ?? previousData)?.tokens.edges.map((it) => it.node) ?? initialState,
    }),
    [newData, previousData],
  );
};
