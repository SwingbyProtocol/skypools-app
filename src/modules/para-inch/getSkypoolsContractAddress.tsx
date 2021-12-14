import { Network } from '.prisma/client';
export { swapMinAmount } from './swapMinAmount';

const CONTRACT_SKYPOOLS = {
  ETHEREUM: '',
  ROPSTEN: '0x7dfbf7E38F188Da1BD337A128ce7A5D758957621',
  BSC: '',
};

export const getSkypoolsContractAddress = (network: Network): string => {
  return CONTRACT_SKYPOOLS[network];
};
