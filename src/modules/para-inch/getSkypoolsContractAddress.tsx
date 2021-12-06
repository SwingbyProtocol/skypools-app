import { Network } from '.prisma/client';
export { swapMinAmount } from './swapMinAmount';

const CONTRACT_SKYPOOLS = {
  ETHEREUM: '',
  ROPSTEN: '0xC7ECc7df4e4F4f6776a9bC6e632ed7d1Db30598A',
  BSC: '',
};

export const getSkypoolsContractAddress = (network: Network): string => {
  return CONTRACT_SKYPOOLS[network];
};
