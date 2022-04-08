import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { logger } from '../logger';
import { buildSkypoolsContract, getWrappedBtcAddress } from '../para-inch';
import { buildWBtcContract } from '../para-inch/buildWBtcContract';
import { getDefaultNetwork } from '../networks';
import { useWalletConnection } from '../hooks/useWalletConnection';

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
      const btcDecimals = 8;
      const token = {
        btc: '0x0000000000000000000000000000000000000000',
        wrappedBtc: getWrappedBtcAddress(contractsNetwork),
      };

      const wBtcContract = buildWBtcContract(contractsNetwork);
      const contract = buildSkypoolsContract(contractsNetwork);

      const results = await Promise.all([
        contract.methods.getFloatReserve(token.btc, token.wrappedBtc).call(),
        wBtcContract.methods.decimals().call(),
      ]);
      const floats = results[0];
      const btc = ethers.utils.formatUnits(floats[0], btcDecimals);
      const wrappedBtc = ethers.utils.formatUnits(floats[1], results[1]);

      setFloats({
        btc,
        wrappedBtc,
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
