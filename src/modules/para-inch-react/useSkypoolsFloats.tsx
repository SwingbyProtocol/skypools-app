import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildContext } from '@swingby-protocol/sdk';

import { logger } from '../logger';
import { getDefaultNetwork } from '../networks';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { fetcher } from '../fetch';
import { mode } from '../env';

export interface IFloatAmount {
  amount: string;
  currency: string;
}

const getFloatBalance = (currency: string, floatInfos: IFloatAmount[]): string => {
  let floatBalance = '';
  try {
    floatInfos.forEach((floatInfo) => {
      if (floatInfo.currency === currency) {
        floatBalance = floatInfo.amount;
      }
    });
  } catch (err) {
    console.error(err);
  }
  return floatBalance;
};

const tokensSymbol = {
  btc: 'BTC',
  wbtc: 'WBTC',
};

export const useSkypoolsFloats = () => {
  const { network } = useWalletConnection();
  let contractsNetwork = network || getDefaultNetwork();
  const [floats, setFloats] = useState<{ btc: string; wrappedBtc: string }>({
    btc: '0',
    wrappedBtc: '0',
  });

  const floatsInformation = useCallback(async () => {
    if (!contractsNetwork) return;
    try {
      const context = await buildContext({ mode });
      const floatBalanceUrl = context.servers.swapNode.btc_skypool + '/api/v1/floats/balances';

      const results = await fetcher<IFloatAmount[]>(floatBalanceUrl);
      const floats = {
        btc: getFloatBalance(tokensSymbol.btc, results),
        wbtc: getFloatBalance(tokensSymbol.wbtc, results),
      };

      setFloats({
        btc: floats.btc,
        wrappedBtc: floats.wbtc,
      });
    } catch (error) {
      logger.error(error);
      setFloats({
        btc: '0',
        wrappedBtc: '0',
      });
    }
  }, [contractsNetwork]);

  useEffect(() => {
    floatsInformation();

    const interval = setInterval(() => {
      floatsInformation();
    }, 30000);

    return () => clearInterval(interval);
  }, [floatsInformation]);

  return useMemo(() => {
    return {
      floats,
    };
  }, [floats]);
};
