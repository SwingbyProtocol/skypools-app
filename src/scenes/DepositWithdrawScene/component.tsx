import React from 'react';

import { Layout } from '../../components/Layout';
import { useTokens } from '../../modules/para-inch-react';

import { DepositWithdraw } from './DepositWithdraw';

export const DepositWithdrawScene = () => {
  const { tokens } = useTokens();
  const widget = tokens ? <DepositWithdraw tokens={tokens} /> : <div>Loading</div>;

  return (
    <Layout
      priceHistory={null}
      widgetContent={widget}
      isSkybridgeWidget={false}
      isAccountBalance={true}
    />
  );
};
