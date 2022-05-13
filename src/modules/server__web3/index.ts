import { StringifiableRecord, stringifyUrl } from 'query-string';
import Web3 from 'web3';

import { fetcher } from '../fetch';
import { Network } from '../networks';
import {
  server__etherscanSecret,
  server__infuraProjectId,
  server__infuraProjectSecret,
} from '../server__env';
import { Erc20ABI } from '../abis/erc20';

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

export const getScanApiUrl = (network: Network) => {
  switch (network) {
    case Network.ETHEREUM:
      return 'https://api.etherscan.io/api';
    case Network.ROPSTEN:
      return 'https://api-ropsten.etherscan.io/api';
    default:
      throw new Error(`Cannot find a scan API endpoint for network "${network}"`);
  }
};

export const increaseAllowance = async (
  tokenAddress: string,
  contractAddress: string,
  userAddress: string,
  allowance: number,
  web3: Web3,
): Promise<void> => {
  const tokenContract = new web3.eth.Contract(Erc20ABI as any, tokenAddress);
  await tokenContract.methods.increaseAllowance(contractAddress, allowance).send({
    from: userAddress,
  });
};

export const checkTokenAllowance = async (
  tokenAddress: string,
  contractAddress: string,
  userAddress: string,
  minAllowance: number,
  web3: Web3,
): Promise<boolean> => {
  const tokenContract = new web3.eth.Contract(Erc20ABI as any, tokenAddress);

  try {
    const result = Number(
      await tokenContract.methods.allowance(userAddress, contractAddress).call(),
    );

    if (!result || result < minAllowance) {
      return false;
    }
  } catch (error) {
    console.error('Allowance check failed', error);
    return false;
  }

  return true;
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
    default:
      throw new Error(`Cannot find a transaction explorer for network "${network}"`);
  }
};
