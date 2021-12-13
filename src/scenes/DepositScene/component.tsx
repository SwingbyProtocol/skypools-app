import React from 'react';

import { Layout } from '../../components/Layout';

import { Erc20Deposit } from './SkypoolsSwap';

export const DepositScene = () => {
  const widget = (
    <div>
      <div>Deposit</div>
      <Erc20Deposit />
    </div>
  );

  return (
    <Layout
      priceHistory={null}
      widgetContent={widget}
      isSkybridgeWidget={false}
      isAccountBalance={true}
    />
  );
};
