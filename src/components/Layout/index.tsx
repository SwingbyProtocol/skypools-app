import { Card } from '../Card';
import { Header } from '../Header';
import { TradingView } from '../TradingView';

import { History } from './History';
import {
  chartContainer,
  headerContainer,
  historyCard,
  historyContainer,
  priceAndPathCard,
  swapScene,
  widgetCard,
  skybridgeWidgetCard,
} from './styles';

type Props = {
  priceHistory?: React.ComponentPropsWithoutRef<typeof TradingView>['data'] | null | undefined;
  afterPriceChart?: React.ReactNode;
  widgetContent?: React.ReactNode;
  isSkybridgeWidget: boolean;
};

export const Layout = ({
  priceHistory,
  afterPriceChart = null,
  widgetContent = null,
  isSkybridgeWidget = false,
}: Props) => {
  return (
    <div css={swapScene}>
      <Header css={headerContainer} />

      <Card css={priceAndPathCard}>
        {!!priceHistory && priceHistory.length > 0 && (
          <div css={chartContainer}>
            <TradingView data={priceHistory} />
          </div>
        )}

        {afterPriceChart}
      </Card>

      <Card css={isSkybridgeWidget ? [widgetCard, skybridgeWidgetCard] : widgetCard}>
        {widgetContent}
      </Card>

      <div css={historyContainer}>
        <History css={historyCard} />
      </div>
    </div>
  );
};
