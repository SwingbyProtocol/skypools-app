import { Network } from '@prisma/client';

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

export const ONBOARD_NETWORK_IDS = Object.values(Network).map(getNetworkId);
export type OnboardNetworkId = typeof ONBOARD_NETWORK_IDS[number];

export const isValidNetworkId = (value: any): value is OnboardNetworkId =>
  !!ONBOARD_NETWORK_IDS.find((it) => `${it}` === `${value}`);
