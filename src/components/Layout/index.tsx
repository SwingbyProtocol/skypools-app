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
  balanceScene,
  widgetCard,
  skybridgeWidgetCard,
  balanceCard,
} from './styles';

type Props = {
  priceHistory?: React.ComponentPropsWithoutRef<typeof TradingView>['data'] | null | undefined;
  afterPriceChart?: React.ReactNode;
  widgetContent?: React.ReactNode;
  isSkybridgeWidget: boolean;
  isAccountBalance?: boolean;
};

export const Layout = ({
  priceHistory,
  afterPriceChart = null,
  widgetContent = null,
  isSkybridgeWidget = false,
  isAccountBalance = false,
}: Props) => {
  return (
    <div css={isAccountBalance ? balanceScene : swapScene}>
      <Header css={headerContainer} />

      {!isAccountBalance && (
        <Card css={priceAndPathCard}>
          {!!priceHistory && priceHistory.length > 0 && (
            <div css={chartContainer}>
              <TradingView data={priceHistory} />
            </div>
          )}

          {afterPriceChart}
        </Card>
      )}

      <Card
        css={
          isAccountBalance
            ? [widgetCard, balanceCard]
            : isSkybridgeWidget
            ? [widgetCard, skybridgeWidgetCard]
            : widgetCard
        }
      >
        {widgetContent}
      </Card>

      <div css={historyContainer}>
        <History css={historyCard} />
      </div>
    </div>
  );
};
