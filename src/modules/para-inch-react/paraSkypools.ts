import Big from 'big.js';
import { ContractMethod, NetworkID, ParaSwap, SwapSide } from 'paraswap';
import { OptimalRate } from 'paraswap-core';

import { SwapQuery } from '../../generated/skypools-graphql';
import { getNetworkId } from '../networks';
import { getWrappedBtcAddress, getERC20Address, swapMinAmount } from '../para-inch';

// Ref: https://github.com/SwingbyProtocol/skybridge-contract/blob/skypools/scripts/paraswap.js#L62
export const simpleSwapPriceRoute = async ({
  swapQuery,
  wbtcSrcAmount,
  slippage,
  isBtcToToken,
  skypoolsAddress,
}: {
  swapQuery: SwapQuery;
  wbtcSrcAmount: string;
  slippage: string;
  skypoolsAddress: string;
  isBtcToToken: boolean;
}): Promise<{ priceRoute: OptimalRate; minAmount: string }> => {
  const {
    swap: { network, destToken, rawRouteData, initiatorAddress, srcToken },
  } = swapQuery;

  const paraSwap = new ParaSwap(getNetworkId(network));
  const rawPriceRoute = JSON.parse(rawRouteData);
  const srcDecimals = rawPriceRoute.srcDecimals;
  const srcTokenAddress = isBtcToToken
    ? getWrappedBtcAddress({ network })
    : getERC20Address({ network, tokenAddress: srcToken.address });
  const destTokenAddress = isBtcToToken ? destToken.address : getWrappedBtcAddress({ network });
  const beneficiary = isBtcToToken ? initiatorAddress : skypoolsAddress;
  const srcAmount = isBtcToToken
    ? new Big(wbtcSrcAmount).times(`1e${srcDecimals}`).toFixed(0)
    : rawPriceRoute.srcAmount;

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
    rawPriceRoute.destDecimals,
  )) as OptimalRate;

  if (!result) {
    throw Error('No route for this swap');
  }

  const minAmount = swapMinAmount({ destAmount: result.destAmount, slippage });

  return { priceRoute: result, minAmount };
};

export const txDataSpSimpleSwap = async ({
  slippage,
  userAddress,
  swapQuery,
  wbtcSrcAmount,
  isBtcToToken,
  skypoolsAddress,
}: {
  slippage: string;
  userAddress: string;
  skypoolsAddress: string;
  wbtcSrcAmount: string;
  swapQuery: SwapQuery;
  isBtcToToken: boolean;
}) => {
  const { priceRoute, minAmount } = await simpleSwapPriceRoute({
    swapQuery,
    wbtcSrcAmount,
    slippage,
    isBtcToToken,
    skypoolsAddress,
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
    isBtcToToken ? userAddress : skypoolsAddress,
    referrer,
    undefined,
    undefined,
    isBtcToToken ? userAddress : skypoolsAddress,
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
