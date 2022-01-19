import { useRouter } from 'next/router';

import { Layout } from '../../components/Layout';
import { SkybridgeWidget } from '../../components/SkybridgeWidget';
import { useOnboard } from '../../modules/onboard';
import { getWidgetUrl } from '../../modules/skybridge';

import { DepositWithdraw } from './DepositWithdraw';

export const DepositWithdrawScene = () => {
  const { network } = useOnboard();
  const { query } = useRouter();
  const skybridgeId = query.skybridgeId;
  const bridge = network === 'BSC' ? 'btc_bep20' : 'btc_erc';
  const mode = network === 'ROPSTEN' ? 'test' : 'production';
  const widgetUrl = getWidgetUrl({
    disableNavigation: true,
    mode,
    bridge,
    hash: String(skybridgeId),
  });

  const skybridgeWidget = <SkybridgeWidget src={widgetUrl} />;

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
