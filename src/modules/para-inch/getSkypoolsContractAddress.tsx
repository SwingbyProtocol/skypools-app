import { Network } from '.prisma/client';
export { swapMinAmount } from './swapMinAmount';

const CONTRACT_SKYPOOLS = {
  ETHEREUM: '',
  ROPSTEN: '0x664FEDDbC5AdE9EB84eC46bD4be68c6672a0fF5F',
  BSC: '',
};

export const getSkypoolsContractAddress = (network: Network): string => {
  return CONTRACT_SKYPOOLS[network];
};
