import Web3 from 'web3';

import { Network } from '../networks';
import { server__infuraProjectId, server__infuraProjectSecret } from '../server__env';

export const buildWeb3Instance = ({ network }: { network: Network }) => {
  const url = (() => {
    switch (network) {
      case Network.ETHEREUM:
        return `https://:${server__infuraProjectSecret}@mainnet.infura.io/v3/${server__infuraProjectId}`;
      case Network.BSC:
        return 'https://bsc-dataseed1.binance.org:443';
      case Network.POLYGON:
        return 'https://rpc-mainnet.matic.network';
      default:
        throw new Error(`Cannot find an API endpoint for network "${network}"`);
    }
  })();

  return new Web3(new Web3.providers.HttpProvider(url));
};
