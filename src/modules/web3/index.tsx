import { stringifyUrl, StringifiableRecord } from 'query-string';

import { fetcher } from '../fetch';
import { Network } from '../networks';
import { server__bscscanSecret, server__etherscanSecret } from '../server__env';

export const scanApiFetcher = async <Data extends unknown = unknown>({
  network,
  query,
}: {
  network: Network;
  query?: StringifiableRecord;
}) => {
  const result = await fetcher<{ status: string } & Data>(
    stringifyUrl({
      url: getScanApiUrl({ network }),
      query: {
        ...query,
        apikey: getScanApiKey({ network }),
      },
    }),
  );
  if (result.status === '0') {
    throw new Error((result as any).result);
  }

  return result;
};

const getScanApiKey = ({ network }: { network: Network }) => {
  switch (network) {
    case Network.ETHEREUM:
      return server__etherscanSecret;
    case Network.BSC:
      return server__bscscanSecret;
    case Network.POLYGON:
      return undefined;
    default:
      return undefined;
  }
};

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
