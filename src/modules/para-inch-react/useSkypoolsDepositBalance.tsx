import { ethers } from 'ethers';
import { useEffect, useMemo, useState, useCallback } from 'react';

import { SwapDocument, useSwapQuery } from '../../generated/skypools-graphql';
import { logger } from '../logger';
import { useOnboard } from '../onboard';
import { getERC20Address, getWrappedBtcAddress } from '../para-inch';
import { buildSkypoolsContract } from '../skypools';

export const useSkypoolsDepositBalance = (swapId: string) => {
  const { address, wallet } = useOnboard();

  const { data } = useSwapQuery({
    query: SwapDocument,
    variables: { id: swapId },
  });

  const [depositBalance, setDepositBalance] = useState<{ balance: string; token: string }>({
    balance: '',
    token: '',
  });

  const isBtcToToken = data?.swap.srcToken.symbol === 'BTC';

  const updateDepositBalance = useCallback(async () => {
    if (!wallet || !address || !data) return;
    const { network, srcToken } = data.swap;
    try {
      const contract = buildSkypoolsContract({ provider: wallet.provider, network });
      const token = isBtcToToken
        ? getWrappedBtcAddress({ network })
        : getERC20Address({ network, tokenAddress: data.swap.srcToken.address });
      const rawRouteData = JSON.parse(data.swap.rawRouteData);
      const rawBal = await contract.methods.balanceOf(token, address).call();
      const decimals = rawRouteData.srcDecimals;
      const balance = ethers.utils.formatUnits(rawBal, decimals);

      setDepositBalance({
        balance,
        token: srcToken.symbol,
      });
    } catch (error) {
      logger.error(error);
      setDepositBalance({
        balance: '',
        token: '',
      });
    }
  }, [wallet, data, isBtcToToken, address]);

  useEffect(() => {
    updateDepositBalance();

    const interval = setInterval(() => {
      updateDepositBalance();
    }, 20000);

    return () => clearInterval(interval);
  }, [updateDepositBalance]);

  return useMemo(() => {
    return {
      depositBalance,
    };
  }, [depositBalance]);
};
