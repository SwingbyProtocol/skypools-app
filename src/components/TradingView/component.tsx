import React, { useEffect, useRef } from 'react';
import { useMeasure } from 'react-use';
import { createChart, IChartApi, ISeriesApi, PriceScaleMode } from 'lightweight-charts';
import { useIntl } from 'react-intl';

import { container, wrapper } from './styles';

// Fixme
export type Props = any;
// export type Props = Promise<{ data: Array<{ time: string; value: number }> }>;

export const TradingView = ({ data = [] }: Props) => {
  const { locale } = useIntl();
  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();
  const chartDivRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    chartRef.current = createChart(chartDivRef.current!, {
      leftPriceScale: { visible: true, borderVisible: false, mode: PriceScaleMode.Normal },
      rightPriceScale: { visible: false },
      timeScale: { fixLeftEdge: true, borderVisible: false },
      layout: { fontSize: 10 },
      grid: { vertLines: { visible: false } },
      handleScroll: {
        vertTouchDrag: false,
        mouseWheel: false,
        pressedMouseMove: true,
        horzTouchDrag: true,
      },
      handleScale: {
        mouseWheel: false,
        pinch: true,
        axisDoubleClickReset: true,
        axisPressedMouseMove: true,
      },
    });

    return () => {
      chartRef.current?.remove();
      chartRef.current = null;
      areaSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (areaSeriesRef.current) {
      chartRef.current.removeSeries(areaSeriesRef.current);
    }

    areaSeriesRef.current = chartRef.current.addAreaSeries();
    areaSeriesRef.current.setData(data);
  }, [data]);

  useEffect(() => {
    chartRef.current?.resize(width, height);
  }, [width, height]);

  useEffect(() => {
    chartRef.current?.applyOptions({ localization: { locale } });
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    const styles = getComputedStyle(chartDivRef.current!);

    const updateColors = () => {
      if (cancelled) return;

      chartRef.current?.applyOptions({
        layout: {
          backgroundColor: 'transparent',
          textColor: `hsl(${styles.getPropertyValue('--sp-color-text-normal')})`,
          fontFamily: styles.getPropertyValue('font-family'),
        },
        leftPriceScale: {
          borderColor: styles.getPropertyValue('--sp-color-border-normal'),
        },
      });

      areaSeriesRef.current?.applyOptions({
        baseLineColor: 'red',
        lineColor: `hsl(${styles.getPropertyValue('--sp-color-primary-normal')})`,
        topColor: `hsl(${styles.getPropertyValue('--sp-color-primary-normal')})`,
        priceLineColor: 'red',
        baseLineVisible: false,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      setTimeout(updateColors, 750);
    };

    updateColors();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={containerRef} css={container}>
      <div ref={chartDivRef} css={wrapper} />
    </div>
  );
};
