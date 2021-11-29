import { Network } from '../networks';

export const getScanApiUrl = ({ network }: { network: Network }) => {
  switch (network) {
    case Network.ETHEREUM:
      return 'https://api.etherscan.io/api';
    case Network.ROPSTEN:
      return 'https://api-ropsten.etherscan.io/api';
    case Network.BSC:
      return 'https://api.bscscan.com/api';
    // case 97:
    //   return 'https://api-testnet.bscscan.com/api';
    default:
      throw new Error(`Cannot find a scan API endpoint for network "${network}"`);
  }
};

export const buildLinkToTransaction = ({
  network,
  transactionHash,
}: {
  network: Network;
  transactionHash: string;
}) => {
  switch (network) {
    case Network.ETHEREUM:
      return `https://etherscan.io/tx/${transactionHash}`;
    case Network.ROPSTEN:
      return `https://ropsten.etherscan.io/tx/${transactionHash}`;
    case Network.BSC:
      return `https://bscscan.com/tx/${transactionHash}`;
    // case 97:
    //   return `https://testnet.bscscan.com/tx/${transactionHash}`;
    default:
      throw new Error(`Cannot find a transaction explorer for network "${network}"`);
  }
};
