import { useMeasure } from 'react-use';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import { FormattedDate, FormattedNumber, useIntl, FormattedMessage } from 'react-intl';
import { useRef, useEffect, useCallback, useState, createContext, useContext } from 'react';
import { stripUnit } from 'polished';
import { Big } from 'big.js';
import { DateTime } from 'luxon';

import { size } from '../../../modules/styles';
import {
  ParaInchHistoryItem,
  useParaInchForm,
  useParaInchHistory,
} from '../../../modules/para-inch-react';
import { shortenAddress } from '../../../modules/short-address';
import { buildLinkToTransaction } from '../../../modules/web3';
import { Coin } from '../../../components/Coin';
import { SwapStatus } from '../../../generated/skypools-graphql';
import { isFakeBtcToken } from '../../../modules/para-inch';

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
  iconCompleted,
  iconFailed,
  iconPending,
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
  const { network } = useParaInchForm();
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
          item.status === SwapStatus.Completed && iconCompleted,
          item.status === SwapStatus.Pending && iconPending,
          item.status === SwapStatus.Failed && iconFailed,
        ]}
      >
        <SwapIcon />
      </div>

      <div css={status}>
        <FormattedMessage id={`history.status.${item.status}`} />
      </div>
      <div css={time}>
        <FormattedDate
          value={DateTime.fromISO(item.createdAt).toJSDate()}
          dateStyle="short"
          timeStyle="short"
          hour12={false}
        />
      </div>

      {!!item.srcAmount && new Big(item.srcAmount).gt(0) && (
        <>
          <Coin src={item.srcToken?.logoUri} css={coinIn} />
          <div css={amountIn} title={formatNumber(+item.srcAmount, NUMBER_FORMAT_FULL)}>
            {formatNumber(+item.srcAmount, NUMBER_FORMAT_SHORT)}
          </div>
        </>
      )}

      {!!item.destAmount && new Big(item.destAmount).gt(0) && (
        <>
          <Coin src={item.destToken?.logoUri} css={coinOut} />
          <div css={amountOut} title={formatNumber(+item.destAmount, NUMBER_FORMAT_FULL)}>
            {formatNumber(+item.destAmount, NUMBER_FORMAT_SHORT)}
          </div>
        </>
      )}

      <div css={hash}>
        {isFakeBtcToken(item.srcToken.address) && !!item.skybridgeSwapId && (
          <a
            href={`https://widget.skybridge.exchange/${
              item.network === 'ROPSTEN' ? 'test' : 'production'
            }/swap/${item.skybridgeSwapId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {shortenAddress({ value: item.skybridgeSwapId })}
          </a>
        )}

        {item.skypoolsTransactionHashes.map((it) => (
          <a
            key={it}
            href={buildLinkToTransaction({ network, transactionHash: it })}
            target="_blank"
            rel="noopener noreferrer"
          >
            {shortenAddress({ value: it })}
          </a>
        ))}

        {isFakeBtcToken(item.destToken.address) && !!item.skybridgeSwapId && (
          <a
            href={`https://widget.skybridge.exchange/${
              item.network === 'ROPSTEN' ? 'test' : 'production'
            }/swap/${item.skybridgeSwapId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {shortenAddress({ value: item.skybridgeSwapId })}
          </a>
        )}
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

  const { data: swapHistory } = useParaInchHistory();
  const swaps = swapHistory?.swaps.edges.map((it) => it.node) ?? [];

  const itemSize = useCallback(
    (index: number) => {
      return index === 0
        ? itemHeightFirst
        : index === swaps.length - 1
        ? itemHeightLast
        : itemHeightOther;
    },
    [itemHeightFirst, itemHeightLast, itemHeightOther, swaps.length],
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
      <Context.Provider value={swaps}>
        <List
          width={width}
          height={height}
          itemSize={itemSize}
          itemCount={swaps.length}
          ref={listRef}
          direction={direction}
        >
          {Row}
        </List>
      </Context.Provider>
    </div>
  );
};