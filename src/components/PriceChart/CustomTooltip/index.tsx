import React, { useContext } from 'react';
import { useIntl } from 'react-intl';
import type { Tooltip } from 'recharts';

import { PriceChartContext } from '../context';

import { container, dateLocal, dateUtc, price, priceMasked } from './styles';

export const CustomTooltip: React.ComponentPropsWithoutRef<typeof Tooltip>['content'] = ({
  payload,
}) => {
  const { depositCurrency, receivingCurrency: receivingCurrnecy } = useContext(PriceChartContext);
  const { formatDate, formatNumber } = useIntl();

  const data = payload?.[0]?.payload;
  if (!data) return <></>;

  return (
    <div className={container}>
      <div className={dateLocal}>
        {formatDate(data.at, { dateStyle: 'short', timeStyle: 'long', hour12: false })}
      </div>
      <div className={dateUtc}>
        {formatDate(data.at, {
          dateStyle: 'short',
          timeStyle: 'long',
          hour12: false,
          timeZone: 'UTC',
        })}
      </div>
      <div className={price}>
        <span className={priceMasked}>1 {depositCurrency} =</span> {formatNumber(data.price)}{' '}
        {receivingCurrnecy}
      </div>
    </div>
  );
};
