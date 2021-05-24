import React from 'react';

export const PriceChartContext = React.createContext<{
  depositCurrency: string;
  receivingCurrency: string;
}>(null as any);
