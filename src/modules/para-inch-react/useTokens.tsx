import { ParaSwap, Token } from 'paraswap';
import { useEffect, useMemo, useState } from 'react';

import { CoinInfo } from '../../components/CoinInput';
import { logger } from '../logger';
import { getNetworkId } from '../networks';
import { useOnboard } from '../onboard';
import { FAKE_BTC_ADDRESS } from '../para-inch';

import { isParaSwapApiError } from './isParaSwapApiError';

const initialState = [
  {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    decimals: 18,
    img: 'https://img.paraswap.network/ETH.png',
    network: 1,
    symbol: 'ETH',
  },
];

export const useTokens = () => {
  const [tokens, setTokens] = useState<CoinInfo[]>(initialState);
  const { network } = useOnboard();

  useEffect(() => {
    (async () => {
      const paraSwap = new ParaSwap(getNetworkId(network ?? 'ETHEREUM'));
      const result = await paraSwap.getTokens();

      const btc = {
        address: FAKE_BTC_ADDRESS,
        decimals: 8,
        img: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579',
        network: network ? getNetworkId(network) : 1,
        symbol: 'BTC',
      } as Token;

      if (isParaSwapApiError(result)) {
        logger.error({ err: result }, 'Failed to get tokens from ParaSwap');
        throw result;
      }

      const disabledCoins = ['WBTC', 'WETH'];
      const formattedTokens = result.filter(
        (it) => !disabledCoins.find((that) => that === it.symbol),
      );
      formattedTokens.splice(1, 0, btc);
      setTokens(formattedTokens as CoinInfo[]);
    })();
  }, [network]);

  return useMemo(() => {
    return {
      tokens,
    };
  }, [tokens]);
};
