import { useEffect, useMemo, useState } from 'react';
import { API as OnboardInstance } from 'bnc-onboard/dist/src/interfaces'; // eslint-disable-line import/no-internal-modules
import { useMedia } from 'react-use';

import { isValidNetworkId } from './networks';
import { initOnboard } from './initOnboard';

export const useOnboardInstance = () => {
  const [updateCount, setUpdateCount] = useState(0);
  const isDarkMode = useMedia('(prefers-color-scheme: dark)', false);

  const onboard = useMemo((): OnboardInstance | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    const forceRender = async () => {
      setUpdateCount((value) => (value >= Number.MAX_SAFE_INTEGER ? 0 : value + 1));

      const network = onboard?.getState().network;
      if (isValidNetworkId(network)) {
        onboard?.config({ networkId: network });
        return;
      }

      if (onboard?.getState().wallet?.provider) {
        return await onboard?.walletCheck();
      }

      if (await onboard?.walletSelect()) {
        await onboard?.walletCheck();
      } else {
        await onboard?.walletReset();
      }
    };

    return initOnboard({
      subscriptions: {
        address: forceRender,
        wallet: forceRender,
        network: forceRender,
        balance: forceRender,
      },
    });
  }, []);

  useEffect(() => {
    onboard?.config({ darkMode: isDarkMode });
  }, [onboard, isDarkMode]);

  return useMemo(() => {
    const wallet = onboard?.getState().wallet ?? null;
    const network = onboard?.getState().network ?? null;
    return {
      updateCount,
      address: onboard?.getState().address ?? null,
      wallet: wallet?.provider ? wallet : null,
      onboard,
      network: isValidNetworkId(network) ? network : null,
    };
  }, [onboard, updateCount]);
};
