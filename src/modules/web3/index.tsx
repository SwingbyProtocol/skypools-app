import Web3 from 'web3';
import { BigNumber } from 'ethers';

import { Network } from '../networks';
import { Erc20ABI } from '../abis/erc20';

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

export const increaseAllowance = async (
  tokenAddress: string,
  contractAddress: string,
  userAddress: string,
  allowance: BigNumber,
  web3: Web3,
): Promise<void> => {
  const tokenContract = new web3.eth.Contract(Erc20ABI as any, tokenAddress);
  await tokenContract.methods.approve(contractAddress, allowance).send({
    from: userAddress,
  });
};
