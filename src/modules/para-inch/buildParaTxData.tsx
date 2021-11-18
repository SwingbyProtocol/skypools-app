import { NetworkID, ParaSwap } from 'paraswap';
import { OptimalRate } from 'paraswap-core';

import { swapMinAmount } from '../skypools';

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
  const txParams = await paraSwap.buildTx(
    srcToken,
    destToken,
    srcAmount,
    minAmount,
    priceRoute,
    userAddress,
    referrer,
    userAddress,
  );

  return txParams;
};
