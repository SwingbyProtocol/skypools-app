import { ContractMethod, NetworkID, ParaSwap, SwapSide } from 'paraswap';
import { OptimalRate } from 'paraswap-core';

import { getNetworkId, Network } from '../networks';
import { isParaSwapApiError, swapMinAmount } from '../para-inch';
import { logger } from '../logger';

export interface SimpleSwapQuote {
  userAddress: string;
  skypoolsAddress: string;
  network: Network;
  isFromBtc: boolean;
  slippage: string;
  destTokenAddress: string;
  srcTokenAddress: string;
  destDecimals: number;
  srcDecimals: number;
  srcAmount: string;
}

// Ref: https://github.com/SwingbyProtocol/skybridge-contract/blob/skypools/scripts/paraswap.js#L62
export const simpleSwapPriceRoute = async (
  simpleSwapQuoteData: SimpleSwapQuote,
): Promise<{ priceRoute: OptimalRate; minAmount: string }> => {
  const {
    destTokenAddress,
    network,
    srcDecimals,
    srcTokenAddress,
    srcAmount,
    destDecimals,
    userAddress,
    skypoolsAddress,
    isFromBtc,
    slippage,
  } = simpleSwapQuoteData;

  const paraSwap = new ParaSwap(getNetworkId(network));

  const beneficiary = isFromBtc ? userAddress : skypoolsAddress;

  const option =
    network === 'ROPSTEN'
      ? {
          includeContractMethods: [ContractMethod.simpleSwap],
          maxImpact: 100,
        }
      : {
          includeContractMethods: [ContractMethod.simpleSwap],
        };

  const result = (await paraSwap.getRate(
    srcTokenAddress,
    destTokenAddress,
    srcAmount,
    beneficiary,
    SwapSide.SELL,
    option,
    srcDecimals,
    destDecimals,
  )) as OptimalRate;

  if (isParaSwapApiError(result)) {
    logger.error({ err: result }, 'Failed to get rate from ParaSwap');
    throw result;
  }

  const minAmount = swapMinAmount({ destAmount: result.destAmount, slippage });
  return { priceRoute: result, minAmount };
};

export const txDataSpSimpleSwap = async (simpleSwapQuoteData: SimpleSwapQuote) => {
  const { isFromBtc, userAddress, skypoolsAddress } = simpleSwapQuoteData;

  const { priceRoute, minAmount } = await simpleSwapPriceRoute(simpleSwapQuoteData);

  const { network, srcToken, destToken, srcAmount } = priceRoute;

  const referrer = 'skypools';

  const paraSwap = new ParaSwap(network as NetworkID);
  const data = (await paraSwap.buildTx(
    srcToken,
    destToken,
    srcAmount,
    minAmount,
    priceRoute,
    isFromBtc ? userAddress : skypoolsAddress,
    referrer,
    undefined,
    undefined,
    isFromBtc ? userAddress : skypoolsAddress,
    {
      ignoreChecks: true,
      onlyParams: true,
    },
  )) as any;

  // Ref: https://github.com/SwingbyProtocol/skybridge-contract/blob/skypools/test/testSkyPools.js#L325
  const dataArray = [
    data[0].fromToken,
    data[0].toToken,
    data[0].fromAmount,
    data[0].toAmount,
    data[0].expectedAmount,
    data[0].callees,
    data[0].exchangeData,
    data[0].startIndexes,
    data[0].values,
    data[0].beneficiary,
    data[0].partner,
    data[0].feePercent,
    data[0].permit,
    data[0].deadline,
    data[0].uuid,
  ];

  return dataArray;
};
