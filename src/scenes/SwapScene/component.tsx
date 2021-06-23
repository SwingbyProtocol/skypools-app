import { Big } from 'big.js';
import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SwapPath } from '../../components/SwapPath';
import { TradingView } from '../../components/TradingView';
import {
  getPriceHistory,
  getSwapQuote,
  isSupportedNetworkId,
  SwapQuote,
  SwapQuoteRoute,
} from '../../modules/para-inch';
import { useParaInch } from '../../modules/para-inch-react';
import { useOnboard } from '../../modules/onboard';
import { logger } from '../../modules/logger';

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
} from './styles';
import { Widget } from './Widget';

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
};

export const SwapScene = () => {
  const { network: onboardNetwork } = useOnboard();
  const { fromToken, toToken, network, setNetwork } = useParaInch();
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [priceHistory, setPriceHistory] = useState<
    React.ComponentPropsWithoutRef<typeof TradingView>['data'] | null
  >(null);

  useEffect(() => {
    if (!onboardNetwork || network === onboardNetwork || !isSupportedNetworkId(onboardNetwork))
      return;
    setNetwork(onboardNetwork);
  }, [onboardNetwork, network, setNetwork]);

  useEffect(() => {
    let cancelled = false;

    const fromTokenAddress = fromToken?.address;
    const toTokenAddress = toToken?.address;
    if (!fromTokenAddress || !toTokenAddress) {
      return;
    }

    const loadQuote = async () => {
      try {
        if (cancelled) return;

        setSwapQuote(null);
        const result = await getSwapQuote({
          fromTokenAddress,
          toTokenAddress,
          amount: new Big(1).times('1e18').toFixed(),
          network,
        });

        if (cancelled) return;
        setSwapQuote(result);
      } catch (err) {
        logger.error({ err }, 'Failed to load swap quote');
        setTimeout(loadQuote, 2500);
      }
    };

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [fromToken, toToken, network]);

  useEffect(() => {
    let cancelled = false;

    const fromTokenAddress = fromToken?.address;
    const toTokenAddress = toToken?.address;
    if (!fromTokenAddress || !toTokenAddress) {
      return;
    }

    const loadPriceHistory = async () => {
      try {
        if (cancelled) return;

        setPriceHistory(null);
        const result = await getPriceHistory({
          fromTokenAddress,
          toTokenAddress,
          network,
        });

        if (cancelled) return;
        setPriceHistory(result.map((it) => ({ time: it.at.toISO(), value: it.value.toNumber() })));
      } catch (err) {
        logger.error({ err }, 'Failed to load price history');
        setTimeout(loadPriceHistory, 2500);
      }
    };

    loadPriceHistory();

    return () => {
      cancelled = true;
    };
  }, [fromToken, toToken, network]);

  return (
    <div css={swapScene}>
      <Header css={headerContainer} />

      <Card css={priceAndPathCard}>
        <div css={[chartContainer, priceHistory === null && loadingPulseAnimation]}>
          <TradingView data={priceHistory ?? FAKE_PRICE_HISTORY} />
        </div>

        <div css={swapPathContainer}>
          <SwapPath
            css={swapQuote === null && loadingPulseAnimation}
            value={swapQuote?.routes[0] ?? FAKE_QUOTE_ROUTE}
          />
        </div>
      </Card>

      <Card css={widgetCard}>
        <Widget />
      </Card>

      <History css={historyCard} />
    </div>
  );
};
