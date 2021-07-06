import { useMeasure } from 'react-use';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import Image from 'next/image';
import { FormattedDate, FormattedNumber, useIntl } from 'react-intl';
import { DateTime } from 'luxon';
import { useRef, useEffect, useCallback, useState, createContext, useContext } from 'react';
import { stripUnit } from 'polished';

import { size } from '../../../modules/styles';
import { ParaInchHistoryItem, useParaInchHistory } from '../../../modules/para-inch-react';

import {
  amountIn,
  amountOut,
  container,
  hash,
  icon,
  rowContainer,
  time,
  type,
  firstRow,
  lastRow,
  sizeCalc,
} from './styles';

type Props = { className?: string };

const NUMBER_FORMAT_SHORT: Partial<React.ComponentPropsWithoutRef<typeof FormattedNumber>> = {
  maximumSignificantDigits: 8,
  notation: 'compact',
  compactDisplay: 'short',
};

const NUMBER_FORMAT_FULL: Partial<React.ComponentPropsWithoutRef<typeof FormattedNumber>> = {
  maximumFractionDigits: 18,
  notation: 'standard',
  useGrouping: true,
};

const AMOUNT_IN = 1e-8;
const AMOUNT_OUT = Number.MAX_SAFE_INTEGER;

const Context = createContext<ParaInchHistoryItem[]>([]);

const Row = ({ style, index }: ListChildComponentProps) => {
  const { formatNumber } = useIntl();
  const data = useContext(Context);

  const item = data[index];
  if (!item) {
    return <></>;
  }

  return (
    <div
      css={[rowContainer, index === 0 && firstRow, index === data.length - 1 && lastRow]}
      style={style}
    >
      <div css={icon}>
        <Image src="/swap/swap-icon.svg" layout="fill" alt="" />
      </div>

      <div css={type}>swap</div>
      <div css={time}>
        <FormattedDate
          value={DateTime.fromISO('2021-06-11T14:26:53.180Z').toJSDate()}
          dateStyle="short"
          timeStyle="short"
          hour12={false}
        />
      </div>

      <div css={amountIn} title={formatNumber(AMOUNT_IN, NUMBER_FORMAT_FULL)}>
        {formatNumber(AMOUNT_IN, NUMBER_FORMAT_SHORT)}
      </div>
      <div css={amountOut} title={formatNumber(AMOUNT_OUT, NUMBER_FORMAT_FULL)}>
        {formatNumber(AMOUNT_OUT, NUMBER_FORMAT_SHORT)}
      </div>

      <div css={hash}>{item.hash}</div>
    </div>
  );
};

export const History = ({ className }: Props) => {
  const [ref, { width, height }] = useMeasure();
  const stylesRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<List | null>(null);
  const [itemHeightFirst, setItemHeightFirst] = useState<number>(size.city);
  const [itemHeightLast, setItemHeightLast] = useState<number>(size.city);
  const [itemHeightOther, setItemHeightOther] = useState<number>(size.city);

  const { latestTransactions } = useParaInchHistory();

  const itemSize = useCallback(
    (index: number) => {
      return index === 0
        ? itemHeightFirst
        : index === latestTransactions.length - 1
        ? itemHeightLast
        : itemHeightOther;
    },
    [itemHeightFirst, itemHeightLast, itemHeightOther, latestTransactions.length],
  );

  useEffect(() => {
    let cancelled = false;
    const styles = getComputedStyle(stylesRef.current!);

    const test = () => {
      if (cancelled) return;
      setItemHeightFirst(+stripUnit(styles.marginTop));
      setItemHeightLast(+stripUnit(styles.marginBottom));
      setItemHeightOther(+stripUnit(styles.height));
      setTimeout(test, 5000);
    };

    test();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    listRef.current?.resetAfterIndex(0, true);
  }, [itemHeightFirst, itemHeightLast, itemHeightOther]);

  return (
    <div css={container} className={className} ref={ref as any}>
      <div css={sizeCalc} ref={stylesRef} />
      <Context.Provider value={latestTransactions}>
        <List
          width={width}
          height={height}
          itemSize={itemSize}
          itemCount={latestTransactions.length}
          ref={listRef}
        >
          {Row}
        </List>
      </Context.Provider>
    </div>
  );
};
