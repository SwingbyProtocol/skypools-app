import Big from 'big.js';
import { OptimalRate } from 'paraswap-core';

export const buildParaTxData = async ({
  priceRoute,
  slippage,
  userAddress,
  receivingAddress,
  contract,
}: {
  priceRoute: OptimalRate;
  slippage: string;
  userAddress: string;
  receivingAddress?: string;
  contract: 'skypools' | 'paraswap';
}) => {
  const { network, srcToken, srcDecimals, destToken, destDecimals, srcAmount, destAmount } =
    priceRoute;
  const minAmount = new Big(destAmount).times(1 - Number(slippage) / 100).toFixed(0);

  const txConfigBase = {
    priceRoute,
    srcToken,
    srcDecimals,
    destToken,
    destDecimals,
    srcAmount,
    destAmount: minAmount,
    userAddress,
  };

  const txConfig =
    receivingAddress !== '' ? { ...txConfigBase, receiver: receivingAddress } : txConfigBase;

  const headers = {
    'Content-Type': 'application/json',
  };

  const base = 'https://apiv5.paraswap.io';
  const url =
    contract === 'paraswap'
      ? `${base}/transactions/${network}`
      : `${base}/transactions/${network}?skipChecks=true&onlyParams=true`;

  const rawResponse = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(txConfig),
    headers,
  });
  const result = await rawResponse.json();
  return rawResponse.ok && result;
};
