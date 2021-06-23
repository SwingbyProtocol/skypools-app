import { Big } from 'big.js';
import { useEffect, useState } from 'react';

import { Card } from '../../components/Card';
import { Header } from '../../components/Header';
import { SwapPath } from '../../components/SwapPath';
import { TradingView } from '../../components/TradingView';
import { useGetChartData } from '../../modules/history';
import {
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
  swapPathLoading,
} from './styles';
import { Widget } from './Widget';

const FAKE_QUOTE_ROUTE: SwapQuoteRoute = {
  path: [
    [{ exchange: '…', fraction: new Big(1), fromTokenAddress: '0xaa', toTokenAddress: '0xaa' }],
  ],
};

export const SwapScene = () => {
  const { network: onboardNetwork } = useOnboard();
  const { fromToken, toToken, network, setNetwork } = useParaInch();
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);

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

  const { chartData, isLoading } = useGetChartData(
    fromToken as ParaInchToken,
    toToken as ParaInchToken,
  );

  // const data = useMemo(() => {
  //   const BASE_DATE = DateTime.fromISO('2021-05-27T13:44:12.621Z');
  //   return new Array(500)
  //     .fill(null)
  //     .map((_, index) => ({
  //       time: BASE_DATE.plus({ days: index }).toISO(),
  //       value: Math.pow(index, 2),
  //     }))
  //     .sort((a, b) => a.time.localeCompare(b.time));
  // }, []);

  return (
    <div css={swapScene}>
      <Header css={headerContainer} />

      <Card css={priceAndPathCard}>
        <div css={chartContainer}>
          {isLoading ? (
            <div>Loading...</div>
          ) : !chartData ? (
            <div>Chart is not available for the selected pair</div>
          ) : (
            <TradingView data={chartData} />
          )}
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
