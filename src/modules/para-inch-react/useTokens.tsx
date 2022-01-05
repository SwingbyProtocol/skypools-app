import { useRouter } from 'next/router';
import { ParaSwap, Token } from 'paraswap';
import { useEffect, useMemo, useState } from 'react';

import { CoinInfo } from '../../components/CoinInput';
import { logger } from '../logger';
import { getNetworkId } from '../networks';
import { useOnboard } from '../onboard';
import { FAKE_BTC_ADDRESS, getWrappedBtcAddress } from '../para-inch';

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
  const { pathname } = useRouter();
  const isWithdraw = pathname.includes('/withdraw');

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

      const wbtc = {
        address: getWrappedBtcAddress({ network: network ?? 'ETHEREUM' }),
        decimals: 8,
        img: 'https://img.paraswap.network/WBTC.png',
        network: 3,
        symbol: 'WBTC',
      } as Token;

      if (isParaSwapApiError(result)) {
        logger.error({ err: result }, 'Failed to get tokens from ParaSwap');
        throw result;
      }

      const disabledCoins = ['WBTC', 'WETH'];
      const formattedTokens = result.filter(
        (it) => !disabledCoins.find((that) => that === it.symbol),
      );
      formattedTokens.splice(1, 0, isWithdraw ? wbtc : btc);

      setTokens(formattedTokens as CoinInfo[]);
    })();
  }, [network, isWithdraw]);

  return useMemo(() => {
    return {
      tokens,
    };
  }, [tokens]);
};
