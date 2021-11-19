import Big from 'big.js';

export const swapMinAmount = ({
  destAmount,
  slippage,
}: {
  destAmount: string;
  slippage: string;
}): string => {
  if (!destAmount) return '';

  const slippageBig = new Big(Number(slippage));
  const formattedSlippage = new Big(1).minus(slippageBig.div(new Big(100)));

  const minAmount = new Big(destAmount).times(formattedSlippage).toFixed(0);

  return minAmount;
};
