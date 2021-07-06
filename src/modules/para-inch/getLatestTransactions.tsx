import { DateTime } from 'luxon';
import { ParaSwap } from 'paraswap';
import { stringifyUrl } from 'query-string';
import Web3 from 'web3';
import type { provider as Web3Provider } from 'web3-core';
import { Big } from 'big.js';

import { shouldUseParaSwap } from '../env';
import { fetcher } from '../fetch';
import { NetworkId } from '../onboard';

import { isParaSwapApiError } from './isParaSwapApiError';
import { SupportedNetworkId } from './isSupportedNetwork';

type ApiResult = {
  result?: Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    to: string;
    from: string;
    value: string;
    tokenDecimal: string;
    contractAddress: string;
    gas: string;
    gasPrice: string;
    transactionIndex: string;
    confirmations: string;
  }> | null;
};

const getScanApiUrl = ({ network }: { network: NetworkId }) => {
  switch (network) {
    case 1:
      return 'https://api.etherscan.io/api';
    case 5:
      return 'https://api-goerli.etherscan.io/api';
    case 56:
      return 'https://api.bscscan.com/api';
    case 97:
      return 'https://api-testnet.bscscan.com/api';
    case 137:
      return 'https://api.polygonscan.com/api';
    case 80001:
      return 'https://api-testnet.polygonscan.com/api';
    default:
      throw new Error(`Cannot find a scan API endpoint for network "${network}"`);
  }
};

const getSpender = async ({
  network,
  walletProvider,
}: {
  network: SupportedNetworkId;
  walletProvider: Web3Provider;
}): Promise<string> => {
  if (shouldUseParaSwap) {
    const result = await new ParaSwap(network).getSpender(new Web3(walletProvider));
    if (isParaSwapApiError(result)) {
      throw result;
    }

    return result;
  }

  return (
    await fetcher<{ address: string }>(`https://api.1inch.exchange/v3.0/${network}/approve/spender`)
  ).address;
};

export const getLatestTransactions = async ({
  address: addressParam,
  network,
  walletProvider,
}: {
  address: string;
  network: SupportedNetworkId;
  walletProvider: Web3Provider;
}) => {
  const address = addressParam.toLowerCase();
  const spender = (await getSpender({ network, walletProvider })).toLowerCase();
  return (
    (
      await fetcher<ApiResult>(
        stringifyUrl({
          url: getScanApiUrl({ network }),
          query: {
            module: 'account',
            action: 'tokentx',
            address,
            startblock: 1,
            endblock: 99999999,
            sort: 'desc',
          },
        }),
      )
    ).result ?? []
  )
    .map((it) => ({
      blockNumber: `${it.blockNumber}`,
      at: DateTime.fromMillis(+it.timeStamp + 1000, { zone: 'utc' }),
      hash: `${it.hash}`,
      from: `${it.from}`,
      to: `${it.to}`,
      contractAddress: `${it.contractAddress}`,
      value: new Big(it.value).div(`1e${it.tokenDecimal}`),
    }))
    .filter((it) => it.to.toLowerCase() === spender && it.from.toLowerCase() === address);
};
