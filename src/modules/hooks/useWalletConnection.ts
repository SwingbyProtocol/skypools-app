import { useEffect, useState } from 'react';

import { useOnboard } from '../onboard';
import { logger } from '../logger';
import { IGNORED_STORE_WALLET_NAMES, LOCAL_STORAGE } from '../env';
import { getDefaultNetwork } from '../networks';

const useStoredWallet = () => {
  const localStorage = typeof window !== 'undefined' && window.localStorage;
  const [storedWallet, setStoredWallet] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localStorage) {
        const wallet = localStorage.getItem(LOCAL_STORAGE.Wallet);
        setStoredWallet(wallet);
      }
    };
  }, [localStorage, setStoredWallet]);

  const storeWallet = (wallet?: string): void => {
    if (!wallet) {
      return;
    }
    const ignoreWallet = IGNORED_STORE_WALLET_NAMES.find((name) => name === wallet);
    if (localStorage && !ignoreWallet) {
      localStorage.setItem(LOCAL_STORAGE.Wallet, wallet);
    }
  };

  const deleteStoredWallet = (): void => {
    if (localStorage) {
      localStorage?.removeItem(LOCAL_STORAGE.Wallet);
    }
  };

  return {
    storedWallet,
    storeWallet,
    deleteStoredWallet,
  };
};

export const useWalletConnection = () => {
  const { address, network, onboard, wallet } = useOnboard();
  const { deleteStoredWallet, storeWallet, storedWallet } = useStoredWallet();
  const defaultNetwork = getDefaultNetwork();

  useEffect(() => {
    return () => {
      if (wallet?.name) {
        storeWallet(wallet.name);
      }
    };
  }, [wallet, storeWallet]);

  const onWalletConnect = async () => {
    console.log('onWalletConnect');
    try {
      await onboard?.walletSelect();
    } catch (error) {
      logger.error({ error });
    }
  };

  const onWalletDisconnect = async () => {
    console.log('onWalletDisconnect');
    try {
      deleteStoredWallet();
      await onboard?.walletReset();
    } catch (error) {
      logger.error({ error });
    }
  };

  return {
    address,
    wallet,
    network,
    defaultNetwork,
    storedWallet,
    onWalletConnect,
    onWalletDisconnect,
  };
};
