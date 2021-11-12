import Big from 'big.js';
import { NetworkID, ParaSwap } from 'paraswap';
import { OptimalRate } from 'paraswap-core';

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
  const slippageBig = new Big(Number(slippage));
  const formattedSlippage = new Big(1).minus(slippageBig.div(new Big(100)));
  const minAmount = new Big(destAmount).times(formattedSlippage).toFixed(0);
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
