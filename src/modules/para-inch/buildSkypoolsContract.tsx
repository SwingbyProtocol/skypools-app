import { Network } from '@prisma/client';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { getSkypoolsContractAddress } from './getSkypoolsContractAddress';
import ABI from './abi-skypools.json';

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
