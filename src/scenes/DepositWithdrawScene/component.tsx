import { useRouter } from 'next/router';

import { Layout } from '../../components/Layout';
import { SkybridgeWidget } from '../../components/SkybridgeWidget';
import { useOnboard } from '../../modules/onboard';

import { DepositWithdraw } from './DepositWithdraw';

export const DepositWithdrawScene = () => {
  const { network } = useOnboard();
  const { query } = useRouter();
  const skybridgeId = query.skybridgeId;

  const skybridgeWidget = (
    <SkybridgeWidget
      src={`https://widget.skybridge.exchange/${
        network === 'ROPSTEN' ? 'test' : 'production'
      }/swap/${skybridgeId}`}
    />
  );

  return (
    <Layout
      priceHistory={null}
      widgetContent={<DepositWithdraw />}
      skybridgeWidgetContent={network && (skybridgeId ? skybridgeWidget : null)}
      isSkybridgeWidget={false}
      isAccountBalance={true}
    />
  );
};
