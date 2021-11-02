import React, { useEffect, useRef, useMemo } from 'react';
import { useMeasure } from 'react-use';
import { createChart, IChartApi, ISeriesApi, PriceScaleMode } from 'lightweight-charts';
import { useIntl } from 'react-intl';
import { BigSource, Big } from 'big.js';

import { container, wrapper } from './styles';

export type Props = { data: Array<{ at: string; price: BigSource }> };

export const TradingView = ({ data: dataParam = [] }: Props) => {
  const { locale } = useIntl();
  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();
  const chartDivRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  const data = useMemo(
    () =>
      dataParam
        .map((it) => ({
          time: it.at,
          value: new Big(it.price).toNumber(),
        }))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [dataParam],
  );

  useEffect(() => {
    chartRef.current = createChart(chartDivRef.current!, {
      leftPriceScale: { visible: true, borderVisible: false, mode: PriceScaleMode.Normal },
      rightPriceScale: { visible: false },
      timeScale: { fixLeftEdge: false, borderVisible: false },
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

    if (!areaSeriesRef.current) {
      areaSeriesRef.current = chartRef.current.addAreaSeries();
    }

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
