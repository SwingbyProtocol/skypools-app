// @ts-ignore
import { Network } from '@prisma/client';
import Web3 from 'web3';

import { infuraApiKey, isProduction } from '../env';
import { getScanApiUrl } from '../web3';

export { Network };

const RPC_URLS: Record<number, string> = {
  1: `https://mainnet.infura.io/v3/${infuraApiKey}`,
  3: `https://ropsten.infura.io/v3/${infuraApiKey}`,
  5: `https://goerli.infura.io/v3/${infuraApiKey}`,
  56: 'https://bsc-dataseed1.binance.org:443',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  137: 'https://rpc-mainnet.matic.network',
  80001: 'https://rpc-mumbai.matic.today',
} as const;

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

export const getRpcServiceUrl = (chainID: number): string => {
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

export type ChainConfig = {
  id: number;
  name: string;
  shortName: string;
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  blockExplorerUrls: string[];
  iconUrls: string[];
  token: string;
};

const chainsConfig: Record<Network, ChainConfig> = {
  [Network.ETHEREUM]: {
    id: getNetworkId(Network.ETHEREUM),
    name: 'Ethereum',
    shortName: 'Ethereum',
    chainId: getNetworkId(Network.ETHEREUM),
    chainIdHex: '0x1',
    rpcUrl: getRpcServiceUrl(Network.ETHEREUM),
    blockExplorerUrls: [getScanApiUrl(Network.ETHEREUM)],
    iconUrls: [],
    token: 'ETH',
  },
  [Network.ROPSTEN]: {
    id: getNetworkId(Network.ROPSTEN),
    name: 'Ropsten',
    shortName: 'Ropsten',
    chainId: getNetworkId(Network.ROPSTEN),
    chainIdHex: '0x3',
    rpcUrl: getRpcServiceUrl(Network.ROPSTEN),
    blockExplorerUrls: [getScanApiUrl(Network.ROPSTEN)],
    iconUrls: [],
    token: 'ETH',
  },
};

export const getNetworkConfig = (chainId: Network): ChainConfig => {
  if (chainId !== Network.ETHEREUM && chainId !== Network.ROPSTEN) {
    throw new Error('There is no network config for given network');
  }
  return chainsConfig[chainId];
};
