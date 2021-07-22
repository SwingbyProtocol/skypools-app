import type { Big, BigSource } from 'big.js';
import type { TransactionConfig } from 'web3-eth';

import type { ParaInchToken } from '../tokens';
import { Network } from '../../onboard';

export type SwapQuoteRouteStep = {
  exchange: string;
  fraction: Big;
  fromTokenAddress: string;
  toTokenAddress: string;
};

export type OtherSwapQuoteRoute = {
  path: Array<SwapQuoteRouteStep[]>;
  toTokenAmount: Big;
  toTokenAmountUsd: Big;
  estimatedGas: Big | null;
  estimatedGasUsd: Big | null;
  spender: null;
  transaction: null;
  fractionOfBest: Big;
};

export type BestSwapQuoteRoute = Omit<OtherSwapQuoteRoute, 'spender' | 'transaction'> & {
  spender: string | null;
  transaction: {
    from: NonNullable<TransactionConfig['from']>;
    to: NonNullable<TransactionConfig['to']>;
    data: NonNullable<TransactionConfig['data']>;
    value: NonNullable<TransactionConfig['value']>;
    gas: NonNullable<TransactionConfig['gas']>;
    gasPrice: NonNullable<TransactionConfig['gasPrice']>;
    chainId: NonNullable<TransactionConfig['chainId']>;
  } | null;
};

export type SwapQuoteRoute = OtherSwapQuoteRoute | BestSwapQuoteRoute;

export type SwapQuote = {
  fromTokenPriceUsd: Big;
  toTokenPriceUsd: Big;

  fromTokenAmount: Big;
  fromTokenAmountUsd: Big;

  bestRoute: BestSwapQuoteRoute;
  otherRoutes: OtherSwapQuoteRoute[];
};

export type GetSwapQuoteParams = {
  network: Network;
  amount: BigSource;
  fromToken: ParaInchToken;
  toToken: ParaInchToken;
  slippageFraction?: BigSource | null;
  sourceAddress?: string | null;
  walletProvider?: any | null;
};

export type InteralGetSwapQuoteParams = {
  network: Network;
  amount: Big;
  isAmountValid: boolean;
  fromToken: ParaInchToken;
  toToken: ParaInchToken;
  slippageFraction: Big;
  sourceAddress?: string | null;
  walletProvider?: any | null;
};
