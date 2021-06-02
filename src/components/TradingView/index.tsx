import dynamic from 'next/dynamic';
import React from 'react';

import type { Props } from './component';
import { loadingContainer } from './styles';

const DynamicComponent: any = dynamic(
  () => import('./component').then((it) => it.TradingView) as any,
  {
    ssr: false,
    loading: () => <div className={loadingContainer}>…</div>,
  },
);

export const TradingView = ({ data }: Props) => {
  return <DynamicComponent data={data} />;
};
