import { Network } from '@prisma/client';
import Big from 'big.js';
import { ContractMethod, NetworkID, ParaSwap, SwapSide } from 'paraswap';
import { OptimalRate } from 'paraswap-core';

import { SwapQuery } from '../../../generated/skypools-graphql';
import { getNetworkId } from '../../networks';
import { getWrappedBtcAddress } from '../../para-inch';

import { swapMinAmount } from '.';

// Ref: https://github.com/SwingbyProtocol/skybridge-contract/blob/skypools/scripts/paraswap.js#L62
export const simpleSwapPriceRoute = async ({
  swapQuery,
  wbtcSrcAmount,
  slippage,
}: {
  swapQuery: SwapQuery;
  wbtcSrcAmount: string;
  slippage: string;
}): Promise<{ priceRoute: OptimalRate; minAmount: string }> => {
  const {
    swap: { network, destToken, rawRouteData, initiatorAddress },
  } = swapQuery;

  const paraSwap = new ParaSwap(getNetworkId(network));

  const rawPriceRoute = JSON.parse(rawRouteData);

  // Memo: Not listed in the default option in the paraswap
  const spRopstenWbtc = '0x442be68395613bdcd19778e761f03261ec46c06d';

  const srcTokenAddress =
    network === Network.ROPSTEN ? spRopstenWbtc : getWrappedBtcAddress({ network });
  const destTokenAddress = destToken.address;

  // Memo: used Dai(18) when got the quote
  const srcDecimals = network === 'ROPSTEN' ? 8 : rawPriceRoute.srcDecimals;

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
    new Big(wbtcSrcAmount).times(`1e${srcDecimals}`).toFixed(0),
    initiatorAddress,
    SwapSide.SELL,
    option,
    srcDecimals,
    rawPriceRoute.destDecimals,
  )) as OptimalRate;

  if (!result) {
    throw Error('No route for this swap');
  }

  const minAmount = swapMinAmount({ destAmount: result.destAmount, slippage });

  return { priceRoute: result, minAmount };
};

export const dataSpParaSwapBTC2Token = async ({
  slippage,
  userAddress,
  swapQuery,
  wbtcSrcAmount,
}: {
  slippage: string;
  userAddress: string;
  wbtcSrcAmount: string;
  swapQuery: SwapQuery;
}) => {
  const { priceRoute, minAmount } = await simpleSwapPriceRoute({
    swapQuery,
    wbtcSrcAmount,
    slippage,
  });

  const { network, srcToken, destToken, srcAmount } = priceRoute;

  const referrer = 'skypools';

  const paraSwap = new ParaSwap(network as NetworkID);
  const data = (await paraSwap.buildTx(
    srcToken,
    destToken,
    srcAmount,
    minAmount,
    priceRoute,
    userAddress,
    referrer,
    undefined,
    undefined,
    userAddress,
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
