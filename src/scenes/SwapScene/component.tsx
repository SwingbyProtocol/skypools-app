import { Big } from 'big.js';
import React, { useEffect, useMemo } from 'react';
import { DateTime } from 'luxon';
import Web3 from 'web3';
import ABI from 'human-standard-token-abi';

import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SwapPath } from '../../components/SwapPath';
import { TradingView } from '../../components/TradingView';
import { isNativeToken } from '../../modules/para-inch';
import { SwapQuoteRoute } from '../../modules/server__para-inch';
import { useParaInch } from '../../modules/para-inch-react';
import { useOnboard } from '../../modules/onboard';
import { useSkybridgeSwap } from '../../modules/skybridge';
import { usePriceHistoryLazyQuery } from '../../generated/skypools-graphql';

import { History } from './History';
import {
  chartContainer,
  headerContainer,
  historyCard,
  priceAndPathCard,
  swapPathContainer,
  swapScene,
  widgetCard,
  loadingPulseAnimation,
  historyContainer,
  otherExchanges,
} from './styles';
import { Widget } from './Widget';
import { OtherExchanges } from './OtherExchanges';

const FAKE_PRICE_HISTORY = new Array(150)
  .fill(null)
  .map((_, index) => ({
    time: DateTime.utc().minus({ months: index }).toISO(),
    value: 1,
  }))
  .reverse();

const FAKE_QUOTE_ROUTE: SwapQuoteRoute = {
  path: [
    [{ exchange: '…', fraction: new Big(1), fromTokenAddress: '0xaa', toTokenAddress: '0xaa' }],
  ],
  estimatedGas: new Big(0),
  estimatedGasUsd: new Big(0),
  toTokenAmount: new Big(0),
  toTokenAmountUsd: new Big(0),
  transaction: null,
  spender: null,
  fractionOfBest: new Big(1),
};

export const SwapScene = () => {
  const { network: onboardNetwork, wallet, address } = useOnboard();
  const { fromToken, toToken, network, setNetwork, setAmount, swapQuote } = useParaInch();
  const { swapId } = useSkybridgeSwap();
  const [getPriceHistory, { data: priceHistoryData }] = usePriceHistoryLazyQuery();

  const priceHistory = useMemo(
    () =>
      priceHistoryData?.priceHistoric.map(
        (it): React.ComponentPropsWithoutRef<typeof TradingView>['data'][number] => ({
          time: it.at,
          value: +it.price,
        }),
      ),
    [priceHistoryData?.priceHistoric],
  );

  useEffect(() => {
    if (!onboardNetwork) return;
    setNetwork(onboardNetwork);
  }, [onboardNetwork, network, setNetwork]);

  useEffect(() => {
    const firstTokenId = fromToken?.id;
    const secondTokenId = toToken?.id;
    if (!firstTokenId || !secondTokenId) {
      return;
    }

    getPriceHistory({ variables: { firstTokenId, secondTokenId } });
  }, [fromToken, getPriceHistory, toToken]);

  useEffect(() => {
    const walletProvider = wallet?.provider;

    if (!walletProvider || !fromToken || !address || !!swapId) {
      return;
    }

    let cancelled = false;

    (async () => {
      const web3 = new Web3(walletProvider);
      const balance = await (async () => {
        if (isNativeToken(fromToken.address)) {
          return web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');
        }

        const contract = new web3.eth.Contract(ABI, fromToken.address);
        return new Big(await contract.methods.balanceOf(address).call())
          .div(`1e${fromToken.decimals}`)
          .toFixed();
      })();

      if (cancelled) return;
      setAmount(balance);
    })();

    return () => {
      cancelled = true;
    };
  }, [wallet, setAmount, address, fromToken, swapId]);

  return (
    <div css={swapScene}>
      <Header css={headerContainer} />

      <Card css={priceAndPathCard}>
        <div css={[chartContainer, !priceHistory && loadingPulseAnimation]}>
          <TradingView data={priceHistory ?? FAKE_PRICE_HISTORY} />
        </div>

        <div css={swapPathContainer}>
          <SwapPath
            css={swapQuote === null && loadingPulseAnimation}
            value={swapQuote?.bestRoute ?? FAKE_QUOTE_ROUTE}
          />
        </div>

        <OtherExchanges css={otherExchanges} />
      </Card>

      <Card css={widgetCard}>
        <Widget />
      </Card>

      <div css={historyContainer}>
        <History css={historyCard} />
      </div>
    </div>
  );
};
