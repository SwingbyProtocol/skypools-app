import Big from 'big.js';
import { ethers } from 'ethers';
import Web3 from 'web3';

import { getDecimals } from '../web3';

interface IDecimalsArg {
  value: number;
  decimals: number;
}

interface IPriceRoute {
  blockNumber: number;
  network: number;
  srcToken: string;
  srcDecimals: number;
  srcAmount: string;
  destToken: string;
  destDecimals: number;
  destAmount: string;
  bestRoute: BestRoute[];
  gasCostUSD: string;
  gasCost: string;
  side: string;
  tokenTransferProxy: string;
  contractAddress: string;
  contractMethod: string;
  partnerFee: number;
  srcUSD: string;
  destUSD: string;
  partner: string;
  maxImpactReached: boolean;
  hmac: string;
}

interface BestRoute {
  percent: number;
  swaps: Swap[];
}

interface Swap {
  srcToken: string;
  srcDecimals: number;
  destToken: string;
  destDecimals: number;
  swapExchanges: SwapExchange[];
}

interface SwapExchange {
  exchange: string;
  srcAmount: string;
  destAmount: string;
  percent: number;
  poolAddresses: string[];
  data: Data;
}

interface Data {
  version?: number;
  gasUSD: string;
  fee?: number;
}

interface ITokenInput {
  address: string;
  id: string;
  symbol: string;
}

interface IArg {
  tokenFrom: ITokenInput;
  tokenTo: ITokenInput;
  depositAmount: string;
  network: number;
  priceRoute: any;
  slippage: number;
  userAddress: string;
  receivingAddress: string;
}

const toDecimalsAmount = (arg: IDecimalsArg) => {
  const { value, decimals } = arg;
  const amount = String(ethers.utils.parseUnits(String(value), decimals));
  return amount;
};

export const buildParaData = async ({
  arg,
  contract,
  provider,
}: {
  arg: IArg;
  contract: 'skypools' | 'paraswap';
  provider: any;
}) => {
  const {
    depositAmount,
    tokenFrom,
    tokenTo,
    network,
    priceRoute,
    slippage,
    userAddress,
    receivingAddress,
  } = arg;

  console.log('priceRoute', priceRoute);
  const srcDecimals = await getDecimals({
    token: tokenFrom.address,
    provider,
  });

  const destDecimals = await getDecimals({
    token: tokenTo.address,
    provider,
  });

  const srcAmount = String(
    toDecimalsAmount({
      value: Number(depositAmount),
      decimals: srcDecimals,
    }),
  );

  const minAmount = new Big(priceRoute.destAmount).times(1 - slippage / 100).toFixed(0);

  const base = 'https://apiv5.paraswap.io';
  const url =
    contract === 'paraswap'
      ? `${base}/transactions/${network}`
      : `${base}/transactions/${network}?skipChecks=true&onlyParams=true`;

  const txConfigBasic = {
    priceRoute,
    srcToken: tokenFrom.address,
    srcDecimals,
    destToken: tokenTo.address,
    destDecimals,
    srcAmount,
    destAmount: minAmount,
    userAddress,
  };
  const txConfig =
    receivingAddress !== '' ? { ...txConfigBasic, receiver: receivingAddress } : txConfigBasic;

  const headers = {
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    txConfig,
  });
  const result = await fetch(url, {
    method: 'POST',
    body,
    headers,
  });
  console.log('result', result);
  const data = result.ok && result.body;

  return data;
};
