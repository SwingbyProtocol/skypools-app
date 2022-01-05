import { DateTime } from 'luxon';
import Link from 'next/link';
import { stripUnit } from 'polished';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FormattedDate, FormattedMessage, FormattedNumber, useIntl } from 'react-intl';
import { useMeasure } from 'react-use';
import { ListChildComponentProps, VariableSizeList as List } from 'react-window';

import { Coin } from '../../../components/Coin';
import { PendingDeposit, useBtcDeposits, useUpdateBtcDeposit } from '../../../modules/localstorage';
import { shortenAddress } from '../../../modules/short-address';
import { size } from '../../../modules/styles';

import {
  amountIn,
  coinIn,
  container,
  firstRow,
  hash,
  lastRow,
  rowContainer,
  sizeCalc,
  time,
  txStatus,
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

const Context = createContext<PendingDeposit[]>([]);

const Row = ({ style, index }: ListChildComponentProps) => {
  const { formatNumber } = useIntl();
  const data = useContext(Context);
  useUpdateBtcDeposit(data[index].hash);
  const btcImage = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579';

  const item = data[index];
  if (!item) {
    return <></>;
  }

  return (
    <div
      css={[rowContainer, index === 0 && firstRow, index === data.length - 1 && lastRow]}
      style={style}
    >
      <Link css={txStatus} href={`/deposit/${item.hash}`} passHref>
        <a href={`/deposit/${item.hash}`}>
          <FormattedMessage id={`history.status.${item.status}`} />
        </a>
      </Link>
      <div css={time}>
        <FormattedDate
          value={DateTime.fromMillis(item.time * 1000).toJSDate()}
          year="numeric"
          month="short"
          day="2-digit"
          hour12={false}
        />
      </div>

      <Coin src={btcImage} css={coinIn} />
      <div css={amountIn} title={formatNumber(+item.amount, NUMBER_FORMAT_FULL)}>
        {formatNumber(+item.amount, NUMBER_FORMAT_SHORT)}
      </div>

      <div css={hash}>
        <a
          href={`https://widget.skybridge.exchange/${item.mode}/swap/${item.hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortenAddress({ value: item.hash })}
        </a>
      </div>
    </div>
  );
};

export const BtcDeposit = ({ className }: Props) => {
  const [ref, { width, height }] = useMeasure();
  const stylesRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<List | null>(null);
  const [itemHeightFirst, setItemHeightFirst] = useState<number>(size.city);
  const [itemHeightLast, setItemHeightLast] = useState<number>(size.city);
  const [itemHeightOther, setItemHeightOther] = useState<number>(size.city);
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('ltr');
  const { depositTxs } = useBtcDeposits();

  const itemSize = useCallback(
    (index: number) => {
      return index === 0
        ? itemHeightFirst
        : index === depositTxs.length - 1
        ? itemHeightLast
        : itemHeightOther;
    },
    [itemHeightFirst, itemHeightLast, itemHeightOther, depositTxs.length],
  );

  useEffect(() => {
    let cancelled = false;
    const styles = getComputedStyle(stylesRef.current!);

    const test = () => {
      if (cancelled) return;
      setItemHeightFirst(+stripUnit(styles.marginTop));
      setItemHeightLast(+stripUnit(styles.marginBottom));
      setItemHeightOther(+stripUnit(styles.height));
      setDirection(styles.direction === 'rtl' ? 'rtl' : 'ltr');
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
      <Context.Provider value={depositTxs}>
        <List
          width={width}
          height={height}
          itemSize={itemSize}
          itemCount={depositTxs.length}
          ref={listRef}
          direction={direction}
        >
          {Row}
        </List>
      </Context.Provider>
    </div>
  );
};
