import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import ABI from './abi-skypools.json';

import { Network } from '.prisma/client';
export { dataSpParaSwapBTC2Token } from './utils';
export { swapMinAmount, simpleSwapPriceRoute } from './utils';
export { useSkybridgeSwap } from './useSkybridgeSwap';

const CONTRACT_SKYPOOLS = {
  ETHEREUM: '',
  // ROPSTEN: '0x42da142C8FAfA8C31701973607990B6d5e92118f', V1 contract
  ROPSTEN: '0x9dD3F00FfeC833B231374aaf042324973fD73335',
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
