import { Network } from '@prisma/client';
import Big from 'big.js';
import { ethers } from 'ethers';

import { getERC20Address, getWrappedBtcAddress, ParaInchToken } from '../../para-inch';
import { SwapQuoteQueryResult } from '../../../generated/skypools-graphql';
import { simpleSwapPriceRoute, SimpleSwapQuote } from '../spSimpleSwap';

type GetSimpleSwapDataProps = {
  isFromBtc: boolean;
  toToken: ParaInchToken;
  fromToken: ParaInchToken;
  network: Network;
  swapQuote: NonNullable<SwapQuoteQueryResult['data']>['swapQuote'];
  address: string;
  contractAddress: string;
  slippage: string;
};

export const getSimpleSwapData = ({
  isFromBtc,
  toToken,
  fromToken,
  network,
  swapQuote,
  address,
  contractAddress,
  slippage,
}: GetSimpleSwapDataProps): SimpleSwapQuote => {
  const destTokenAddress = isFromBtc ? toToken.address : getWrappedBtcAddress(network);
  const srcTokenAddress = isFromBtc
    ? getWrappedBtcAddress(network)
    : getERC20Address({ network, tokenAddress: fromToken.address });

  return {
    userAddress: address,
    skypoolsAddress: contractAddress,
    network,
    isFromBtc,
    slippage,
    destDecimals: toToken.decimals,
    destTokenAddress,
    srcTokenAddress,
    srcDecimals: fromToken.decimals,
    srcAmount: new Big(swapQuote.srcTokenAmount).times(`1e${fromToken.decimals}`).toFixed(0),
  };
};

type GetMinimumAmountProps = {
  isFromBtc: boolean;
  toToken: ParaInchToken | null;
  fromToken: ParaInchToken | null;
  network: Network;
  swapQuote: NonNullable<SwapQuoteQueryResult['data']>['swapQuote'] | null;
  address: string;
  contractAddress: string;
  slippage: string;
};

export const getMinimumAmount = async (
  props: GetMinimumAmountProps,
): Promise<{ amount: string; token: string }> => {
  try {
    if (!props.toToken || !props.fromToken || !props.swapQuote) {
      return {
        amount: '',
        token: '',
      };
    }
    const simpleSwapQuoteData = getSimpleSwapData(props as GetSimpleSwapDataProps);

    const { minAmount } = await simpleSwapPriceRoute(simpleSwapQuoteData);
    return {
      amount: ethers.utils.formatUnits(minAmount, props.toToken.decimals),
      token: props.toToken.symbol,
    };
  } catch (error) {
    return {
      amount: '',
      token: '',
    };
  }
};
