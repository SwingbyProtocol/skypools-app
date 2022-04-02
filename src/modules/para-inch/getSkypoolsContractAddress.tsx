import { Network } from '.prisma/client';
export { swapMinAmount } from './swapMinAmount';

const CONTRACT_SKYPOOLS = {
  ETHEREUM: '0x4A084C0D1f89793Bb57f49b97c4e3a24cA539aAA',
  ROPSTEN: '0x92c95b6227a9f0b4602649bd83f83adc48dae903',
};

export const getSkypoolsContractAddress = (network: Network): string => {
  return CONTRACT_SKYPOOLS[network];
};
