import { Card } from '../Card';
import { TradingView } from '../TradingView';

import {
  balanceCard,
  balanceScene,
  chartContainer,
  depositWithSkybridgeScene,
  priceAndPathCard,
  skybridgeCard,
  skybridgeWidgetCard,
  swapScene,
  widgetCard,
} from './styles';

type Props = {
  priceHistory?: React.ComponentPropsWithoutRef<typeof TradingView>['data'] | null | undefined;
  afterPriceChart?: React.ReactNode;
  widgetContent?: React.ReactNode;
  skybridgeWidgetContent?: React.ReactNode | null;
  isSkybridgeWidget: boolean;
  isAccountBalance?: boolean;
};

export const Layout = ({
  priceHistory,
  afterPriceChart = null,
  widgetContent = null,
  skybridgeWidgetContent = null,
  isSkybridgeWidget = false,
  isAccountBalance = false,
}: Props) => {
  const depositWithdrawScene = skybridgeWidgetContent
    ? [depositWithSkybridgeScene, balanceScene]
    : balanceScene;
  return (
    <div css={isAccountBalance ? depositWithdrawScene : swapScene}>
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

      {skybridgeWidgetContent && (
        <div css={[widgetCard, skybridgeCard]}>{skybridgeWidgetContent}</div>
      )}
    </div>
  );
};
