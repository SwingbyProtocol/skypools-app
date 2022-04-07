import { Network } from '@prisma/client';
import { AbiItem } from 'web3-utils';

import { getWeb3ReadOnly } from '../networks';

import { getSkypoolsContractAddress } from './getSkypoolsContractAddress';
import ABI from './abi-skypools.json';

export const buildSkypoolsContract = (network: Network) => {
  const web3 = getWeb3ReadOnly(network);
  const contractAddress = getSkypoolsContractAddress(network);
  return new web3.eth.Contract(ABI as AbiItem[], contractAddress);
};
