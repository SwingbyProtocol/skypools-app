import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import { Network, SwapDocument, useSwapQuery } from '../../generated/skypools-graphql';
import { logger } from '../logger';
import { useOnboard } from '../onboard';
import { getWrappedBtcAddress } from '../para-inch';
import { buildSkypoolsContract } from '../skypools';

export const useSkypoolsDepositBal = (swapId: string) => {
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

  useEffect(() => {
    if (!wallet || !address || !data) return;
    const { network, srcToken } = data.swap;

    (async () => {
      try {
        const contract = buildSkypoolsContract({ provider: wallet.provider, network });

        // Memo: Not listed in the default option in the paraswap
        const spRopstenWbtc = '0x442be68395613bdcd19778e761f03261ec46c06d';

        const token =
          network === Network.ROPSTEN ? spRopstenWbtc : getWrappedBtcAddress({ network });

        const rawRouteData = JSON.parse(data.swap.rawRouteData);
        const srcDecimals = rawRouteData.srcDecimals;

        const decimals = isBtcToToken ? (network === 'ROPSTEN' ? 8 : srcDecimals) : srcDecimals;

        const rawBal = await contract.methods.balanceOf(token, address).call();

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
    })();
  }, [wallet, data, isBtcToToken, address]);

  return useMemo(() => {
    return {
      depositBalance,
    };
  }, [depositBalance]);
};
