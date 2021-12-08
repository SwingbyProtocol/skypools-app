import { ethers } from 'ethers';
import ABI from 'human-standard-token-abi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';

import { logger } from '../logger';
import { useOnboard } from '../onboard';
import { buildSkypoolsContract, getWrappedBtcAddress } from '../para-inch';

export const useSkypoolsFloats = () => {
  const { wallet, network } = useOnboard();
  const [floats, setFloats] = useState<{ btc: string; wrappedBtc: string } | null>(null);

  const floatsInformation = useCallback(async () => {
    if (!wallet || !network) return;
    try {
      const btcDecimals = 8;
      const token = {
        btc: '0x0000000000000000000000000000000000000000',
        wrappedBtc: getWrappedBtcAddress({ network }),
      };

      const web3 = new Web3(wallet.provider);
      const wBtcContract = new web3.eth.Contract(ABI, token.wrappedBtc);
      const contract = buildSkypoolsContract({ provider: wallet.provider, network });

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
  }, [network, wallet]);

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
