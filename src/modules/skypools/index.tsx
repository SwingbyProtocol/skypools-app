import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import ABI from './abi/skypools.json'; // eslint-disable-line import/no-internal-modules

import { Network } from '.prisma/client';

// Todo
export const CONTRACT_SKYPOOLS = {
  ETHEREUM: '',
  ROPSTEN: '0xf73d63c3eb97389cb5a28c4ad5e8ac428cb16417',
  BSC: '',
};

export const getSkypoolsContractAddress = (network: Network): string => {
  return CONTRACT_SKYPOOLS[network];
};

export const buildSkypoolsContract = ({
  provider,
  network,
}: {
  provider: any;
  network: Network;
}) => {
  const web3 = new Web3(provider);
  const contractAddress = getSkypoolsContractAddress(network);
  return new web3.eth.Contract(ABI as AbiItem[], contractAddress);
};
