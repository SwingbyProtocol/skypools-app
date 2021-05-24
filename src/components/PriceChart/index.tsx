import { Big } from 'big.js';
import { DateTime, Duration } from 'luxon';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMeasure } from 'react-use';

import { CustomTooltip } from './CustomTooltip';
import { PriceChartContext } from './context';

const CHART_MIN_HEIGHT = 200;
const X_AXIS_LABEL_WIDTH = 40;
const Y_AXIS_LABEL_HEIGHT = 60;

const Y_AXIS_STYLES = { fontFeatureSettings: "'tnum' 1" };

type Props = { depositCurrency: string; receivingCurrency: string };

export const PriceChart = (props: Props) => {
  const [ref, { width, height }] = useMeasure();

  const { formatDate } = useIntl();
  const gradientId = useMemo(() => nanoid(), []);

  const data = useMemo(() => {
    const BASE_DATE = DateTime.fromISO('2021-05-27T13:44:12.621Z');
    return new Array(500)
      .fill(null)
      .map((_, index) => ({
        at: BASE_DATE.plus({ days: index }).toMillis(),
        price: Math.pow(index, 2),
      }))
      .sort((a, b) => a.at - b.at);
  }, []);

  const domainX = useMemo(() => {
    const back6months = DateTime.fromMillis(data[data.length - 1].at)
      .minus({ months: 6 })
      .toMillis();

    return [back6months < data[0].at ? data[0].at : back6months, data[data.length - 1].at];
  }, [data]);

  const filteredData = useMemo(
    () => data.filter((it) => it.at >= domainX[0] && it.at <= domainX[1]),
    [domainX, data],
  );

  const domainY = useMemo(
    () => [
      new Big(filteredData[0].price).times('0.8').div(10).round(0).times(10).toNumber(),
      new Big(filteredData[filteredData.length - 1].price)
        .minus(filteredData[0].price)
        .times('1.25')
        .add(filteredData[0].price)
        .div(10)
        .round(0)
        .times(10)
        .toNumber(),
    ],
    [filteredData],
  );

  const ticksY = useMemo(() => {
    const lines = Math.max(Math.floor(height / Y_AXIS_LABEL_HEIGHT), 1);
    const [min, max] = domainY;

    return [
      min,
      ...new Array(lines)
        .fill(0)
        .map((_, index) => Math.round(((max - min) / lines) * (index + 1) + min)),
      max,
    ].filter((it) => it >= min && it <= max);
  }, [domainY, height]);

  const { units: ticksXUnits, ticksX } = useMemo(() => {
    const lines = Math.max(Math.floor(width / X_AXIS_LABEL_WIDTH), 2);
    const [min, max] = domainX;

    const duration = Duration.fromMillis(max - min);
    const units = duration.as('months') > 3 ? 'months' : duration.as('days') > 3 ? 'days' : 'hours';

    return {
      units,
      ticksX: new Array(lines)
        .fill(0)
        .map((_, index) =>
          DateTime.fromMillis(max)
            .startOf(units)
            .minus({ [units]: index + 1 })
            .toMillis(),
        )
        .reverse()
        .filter((it) => it >= min && it <= max),
    };
  }, [domainX, width]);

  return (
    <PriceChartContext.Provider value={props}>
      <ResponsiveContainer width="100%" height="100%" minHeight={CHART_MIN_HEIGHT}>
        <AreaChart data={filteredData}>
          <rect ref={ref as any} x="0" y="0" width="100%" height="100%" fill="none" stroke="none" />

          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="var(--sp-color-primary-normal)" stop-opacity="1" />
              <stop offset="100%" stop-color="var(--sp-color-primary-normal)" stop-opacity="0.25" />
            </linearGradient>
          </defs>

          <XAxis
            fontSize="0.75em"
            fontWeight="500"
            dataKey="at"
            scale="time"
            type="number"
            stroke="var(--sp-color-text-normal)"
            axisLine={false}
            tickLine={false}
            domain={domainX}
            ticks={ticksX}
            tickFormatter={(unixTime) => {
              return formatDate(
                unixTime,
                ticksXUnits === 'months'
                  ? { month: 'short' }
                  : ticksXUnits === 'days'
                  ? { month: 'short', day: 'numeric' }
                  : { hour: 'numeric', minute: 'numeric', hour12: false },
              );
            }}
          />

          <YAxis
            fontSize="0.75em"
            fontWeight="500"
            dataKey="price"
            stroke="var(--sp-color-text-normal)"
            axisLine={false}
            tickLine={false}
            domain={domainY}
            ticks={ticksY}
            style={Y_AXIS_STYLES}
          />

          <CartesianGrid vertical={false} horizontal stroke="var(--sp-color-border-normal)" />

          <Tooltip content={CustomTooltip} />

          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--sp-color-primary-normal)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            fillOpacity="0.1"
            dot={() => <></>}
          />
        </AreaChart>
      </ResponsiveContainer>
    </PriceChartContext.Provider>
  );
};
