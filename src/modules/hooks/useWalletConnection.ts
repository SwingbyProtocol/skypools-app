import { useEffect, useState } from 'react';
// @ts-ignore
import { Network } from '@prisma/client';

import { useOnboard } from '../onboard';
import { logger } from '../logger';
import { IGNORED_STORE_WALLET_NAMES, LOCAL_STORAGE } from '../env';
import { getDefaultNetwork, getNetworkConfig } from '../networks';

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

  const pushNetwork = async (chainId: Network): Promise<void> => {
    if (!onboard || !wallet || wallet.name !== 'MetaMask') {
      console.warn('Unable to push network');
      return;
    }

    const provider = wallet.provider;
    const networkConfig = getNetworkConfig(chainId);

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkConfig.chainIdHex }],
      });
    } catch (switchError) {
      const config = {
        chainId: networkConfig.chainIdHex,
        chainName: networkConfig.name,
        rpcUrls: [networkConfig.rpcUrl],
        blockExplorerUrls: networkConfig.blockExplorerUrls,
        iconUrls: networkConfig.iconUrls,
      };

      // This error code indicates that the chain has not been added to MetaMask.
      if ((switchError as { code: number }).code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [config],
        });
      } else {
        throw switchError;
      }
    }
  };

  return {
    address,
    wallet,
    network,
    defaultNetwork,
    connectedWallet: !!address,
    supportedNetwork: address && network,
    storedWallet,
    onWalletConnect,
    onWalletDisconnect,
    pushNetwork,
  };
};
