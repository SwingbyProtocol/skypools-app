import { Network } from '@prisma/client';
import Web3 from 'web3';

import { isProduction, RPC_URLS } from '../env';

export { Network };

export const getNetworkId = (network: Network) => {
  switch (network) {
    case Network.ETHEREUM:
      return 1;
    case Network.ROPSTEN:
      return 3;
  }

  throw new Error(`Unsupported network: "${network}"`);
};

export const getNetwork = (networkId: number) => {
  switch (networkId) {
    case 1:
      return Network.ETHEREUM;
    case 3:
      return Network.ROPSTEN;
  }

  return null;
};

export const getDefaultNetwork = (): Network => {
  return isProduction ? Network.ETHEREUM : Network.ROPSTEN;
};

export const ONBOARD_NETWORK_IDS = Object.values(Network).map(getNetworkId);
export type OnboardNetworkId = typeof ONBOARD_NETWORK_IDS[number];

export const isValidNetworkId = (value: any): value is OnboardNetworkId =>
  !!ONBOARD_NETWORK_IDS.find((it) => `${it}` === `${value}`);

const web3ReadOnly: Web3[] = [];
const web3HttpProviderOptions = {
  timeout: 10_000,
};

const getRpcServiceUrl = (chainID: number): string => {
  return RPC_URLS[chainID];
};

export const getWeb3ReadOnly = (network: Network): Web3 => {
  const chainID = getNetworkId(network);
  if (!web3ReadOnly[chainID]) {
    web3ReadOnly[chainID] = new Web3(
      new Web3.providers.HttpProvider(getRpcServiceUrl(chainID), web3HttpProviderOptions),
    );
  }
  return web3ReadOnly[chainID];
};
