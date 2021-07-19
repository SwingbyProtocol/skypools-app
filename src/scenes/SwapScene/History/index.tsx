import { useMeasure } from 'react-use';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import { FormattedDate, FormattedNumber, useIntl, FormattedMessage } from 'react-intl';
import { useRef, useEffect, useCallback, useState, createContext, useContext } from 'react';
import { stripUnit } from 'polished';

import { size } from '../../../modules/styles';
import {
  ParaInchHistoryItem,
  useParaInch,
  useParaInchHistory,
} from '../../../modules/para-inch-react';
import { shortenAddress } from '../../../modules/short-address';
import { buildLinkToTransaction } from '../../../modules/web3';
import { Coin } from '../../../components/Coin';

import {
  amountIn,
  amountOut,
  container,
  hash,
  icon,
  rowContainer,
  time,
  status,
  firstRow,
  lastRow,
  sizeCalc,
  iconConfirmed,
  iconPending,
  iconFailed,
  iconSent,
  coinIn,
  coinOut,
} from './styles';
import { ReactComponent as SwapIcon } from './swap.svg';

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

const Context = createContext<ParaInchHistoryItem[]>([]);

const Row = ({ style, index }: ListChildComponentProps) => {
  const { network } = useParaInch();
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
      <div
        css={[
          icon,
          item.status === 'confirmed' && iconConfirmed,
          item.status === 'pending' && iconPending,
          item.status === 'sent' && iconSent,
          item.status === 'failed' && iconFailed,
        ]}
      >
        <SwapIcon />
      </div>

      <div css={status}>
        <FormattedMessage id={`history.status.${item.status}`} />
      </div>
      <div css={time}>
        {!!item.at && (
          <FormattedDate
            value={item.at.toJSDate()}
            dateStyle="short"
            timeStyle="short"
            hour12={false}
          />
        )}
      </div>

      {!!item.fromAmount?.gt(0) && (
        <>
          <Coin src={item.fromToken?.logoUri} css={coinIn} />
          <div css={amountIn} title={formatNumber(+item.fromAmount, NUMBER_FORMAT_FULL)}>
            {formatNumber(+item.fromAmount, NUMBER_FORMAT_SHORT)}
          </div>
        </>
      )}

      {!!item.toAmount?.gt(0) && (
        <>
          <Coin src={item.toToken?.logoUri} css={coinOut} />
          <div css={amountOut} title={formatNumber(+item.toAmount, NUMBER_FORMAT_FULL)}>
            {formatNumber(+item.toAmount, NUMBER_FORMAT_SHORT)}
          </div>
        </>
      )}

      <div css={hash}>
        <a
          href={buildLinkToTransaction({ network, transactionHash: item.hash })}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortenAddress({ value: item.hash })}
        </a>
      </div>
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
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('ltr');

  const { allTransactions } = useParaInchHistory();

  const itemSize = useCallback(
    (index: number) => {
      return index === 0
        ? itemHeightFirst
        : index === allTransactions.length - 1
        ? itemHeightLast
        : itemHeightOther;
    },
    [itemHeightFirst, itemHeightLast, itemHeightOther, allTransactions.length],
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
      <Context.Provider value={allTransactions}>
        <List
          width={width}
          height={height}
          itemSize={itemSize}
          itemCount={allTransactions.length}
          ref={listRef}
          direction={direction}
        >
          {Row}
        </List>
      </Context.Provider>
    </div>
  );
};
