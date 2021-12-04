import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import ABI from './abi-skypools.json';

import { Network } from '.prisma/client';
export { txDataSpSimpleSwap } from './utils';
export { swapMinAmount, simpleSwapPriceRoute } from './utils';
export { useSkybridgeSwap } from './useSkybridgeSwap';

const CONTRACT_SKYPOOLS = {
  ETHEREUM: '',
  ROPSTEN: '0xC7ECc7df4e4F4f6776a9bC6e632ed7d1Db30598A',
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
