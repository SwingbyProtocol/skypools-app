import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { Big } from 'big.js';

import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SwapPath } from '../../components/SwapPath';
import { TradingView } from '../../components/TradingView';
import {
  getSwapQuote,
  isSupportedNetworkId,
  SwapQuote,
  SwapQuoteRoute,
} from '../../modules/para-inch';
import { useParaInch } from '../../modules/para-inch-react';
import { useOnboard } from '../../modules/onboard';
import { logger } from '../../modules/logger';

import {
  priceAndPathCard,
  chartContainer,
  swapPathContainer,
  swapScene,
  widgetCard,
  headerContainer,
  historyCard,
  swapPathLoading,
} from './styles';
import { Widget } from './Widget';
import { History } from './History';

const FAKE_QUOTE_ROUTE: SwapQuoteRoute = {
  path: [
    [{ exchange: '…', fraction: new Big(1), fromTokenAddress: '0xaa', toTokenAddress: '0xaa' }],
  ],
};

export const SwapScene = () => {
  const { network: onboarNetwork } = useOnboard();
  const { fromToken, toToken, network, setNetwork } = useParaInch();
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);

  useEffect(() => {
    if (!onboarNetwork || network === onboarNetwork || !isSupportedNetworkId(onboarNetwork)) return;
    setNetwork(onboarNetwork);
  }, [onboarNetwork, network, setNetwork]);

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

  const data = useMemo(() => {
    const BASE_DATE = DateTime.fromISO('2021-05-27T13:44:12.621Z');
    return new Array(500)
      .fill(null)
      .map((_, index) => ({
        time: BASE_DATE.plus({ days: index }).toISO(),
        value: Math.pow(index, 2),
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, []);

  return (
    <div css={swapScene}>
      <Header css={headerContainer} />

      <Card css={priceAndPathCard}>
        <div css={chartContainer}>
          <TradingView data={data} />
        </div>

        <div css={swapPathContainer}>
          <SwapPath
            css={swapQuote === null && swapPathLoading}
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
