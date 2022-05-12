import { NetworkID, ParaSwap } from 'paraswap';
import { OptimalRate } from 'paraswap-core';
import { APIError, Transaction } from 'paraswap/build/types';

import { swapMinAmount } from './swapMinAmount';

export const buildParaTxData = async ({
  priceRoute,
  slippage,
  userAddress,
}: {
  priceRoute: OptimalRate;
  slippage: string;
  userAddress: string;
}) => {
  const { network, srcToken, destToken, srcAmount, destAmount } = priceRoute;
  const minAmount = swapMinAmount({ destAmount, slippage });
  const paraSwap = new ParaSwap(network as NetworkID);

  const referrer = 'skypools';

  const result: Transaction | APIError = await paraSwap.buildTx(
    srcToken,
    destToken,
    srcAmount,
    minAmount,
    priceRoute,
    userAddress,
    referrer,
    userAddress,
  );

  // @ts-ignore
  if (result?.status) {
    // @ts-ignore
    throw new Error(result?.message);
  }

  return result as Transaction;
};
