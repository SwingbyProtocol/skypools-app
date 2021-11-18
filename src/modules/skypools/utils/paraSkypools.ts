import { Network } from '@prisma/client';
import Big from 'big.js';
import { APIError, ContractMethod, NetworkID, ParaSwap, SwapSide } from 'paraswap';
import { OptimalRate } from 'paraswap-core';

import { SwapQuery } from '../../../generated/skypools-graphql';
import { getNetworkId } from '../../networks';
import { getWrappedBtcAddress } from '../../para-inch';

import { swapMinAmount } from '.';

// Ref: https://github.com/SwingbyProtocol/skybridge-contract/blob/skypools/scripts/paraswap.js#L62
export const simpleSwapPriceRoute = async ({
  swapQuery,
  claimableWbtc,
}: {
  swapQuery: SwapQuery;
  claimableWbtc: string;
}): Promise<OptimalRate | APIError> => {
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

  const result = await paraSwap.getRate(
    srcTokenAddress,
    destTokenAddress,
    new Big(claimableWbtc).times(`1e${srcDecimals}`).toFixed(0),
    initiatorAddress,
    SwapSide.SELL,
    option,
    srcDecimals,
    rawPriceRoute.destDecimals,
  );
  if (!result) {
    throw Error('No route for this swap');
  }

  return result;
};

export const dataSpParaSwapBTC2Token = async ({
  slippage,
  userAddress,
  swapQuery,
  claimableWbtc,
}: {
  slippage: string;
  userAddress: string;
  claimableWbtc: string;
  swapQuery: SwapQuery;
}) => {
  const priceRoute = (await simpleSwapPriceRoute({
    swapQuery,
    claimableWbtc,
  })) as OptimalRate;
  const { network, srcToken, destToken, srcAmount, destAmount } = priceRoute;

  const referrer = 'skypools';

  const minAmount = swapMinAmount({ destAmount, slippage });

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
