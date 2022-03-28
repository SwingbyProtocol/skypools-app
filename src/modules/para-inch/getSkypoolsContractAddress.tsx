import { Network } from '.prisma/client';
export { swapMinAmount } from './swapMinAmount';

const CONTRACT_SKYPOOLS = {
  ETHEREUM: '',
  ROPSTEN: '0x92c95b6227a9f0b4602649bd83f83adc48dae903',
  BSC: '',
};

export const getSkypoolsContractAddress = (network: Network): string => {
  return CONTRACT_SKYPOOLS[network];
};
