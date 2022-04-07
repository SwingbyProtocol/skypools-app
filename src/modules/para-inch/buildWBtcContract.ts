import ABI from 'human-standard-token-abi';
import { Network } from '@prisma/client';

import { getWeb3ReadOnly } from '../networks';

import { getWrappedBtcAddress } from './isFakeToken';

export const buildWBtcContract = (network: Network) => {
  const web3 = getWeb3ReadOnly(network);
  return new web3.eth.Contract(ABI, getWrappedBtcAddress(network));
};
