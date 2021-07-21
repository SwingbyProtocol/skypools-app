import { Network } from '@prisma/client';

export const getScanApiUrl = ({ network }: { network: Network }) => {
  switch (network) {
    case Network.ETHEREUM:
      return 'https://api.etherscan.io/api';
    // case 5:
    //   return 'https://api-goerli.etherscan.io/api';
    case Network.BSC:
      return 'https://api.bscscan.com/api';
    // case 97:
    //   return 'https://api-testnet.bscscan.com/api';
    case Network.POLYGON:
      return 'https://api.polygonscan.com/api';
    // case 80001:
    //   return 'https://api-testnet.polygonscan.com/api';
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
    // case 5:
    //   return `https://goerli.etherscan.io/tx/${transactionHash}`;
    case Network.BSC:
      return `https://bscscan.com/tx/${transactionHash}`;
    // case 97:
    //   return `https://testnet.bscscan.com/tx/${transactionHash}`;
    case Network.POLYGON:
      return `https://polygonscan.com/tx/${transactionHash}`;
    // case 80001:
    //   return `https://mumbai.polygonscan.com/tx/${transactionHash}`;
    default:
      throw new Error(`Cannot find a transaction explorer for network "${network}"`);
  }
};
