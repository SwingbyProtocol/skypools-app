import { StringifiableRecord, stringifyUrl } from 'query-string';
import Web3 from 'web3';

import { fetcher } from '../fetch';
import { Network } from '../networks';
import {
  server__etherscanSecret,
  server__infuraProjectId,
  server__infuraProjectSecret,
} from '../server__env';
import { getScanApiUrl } from '../web3';

export const buildWeb3Instance = ({ network }: { network: Network }) => {
  const url = (() => {
    switch (network) {
      case Network.ETHEREUM:
        return `https://:${server__infuraProjectSecret}@mainnet.infura.io/v3/${server__infuraProjectId}`;
      default:
        throw new Error(`Cannot find an API endpoint for network "${network}"`);
    }
  })();

  return new Web3(new Web3.providers.HttpProvider(url));
};

export const scanApiFetcher = async <Data extends unknown = unknown>({
  network,
  query,
}: {
  network: Network;
  query?: StringifiableRecord;
}) => {
  const result = await fetcher<{ status: string } & Data>(
    stringifyUrl({
      url: getScanApiUrl(network),
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
    default:
      return undefined;
  }
};
