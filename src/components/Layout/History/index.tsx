import { Big } from 'big.js';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { stripUnit } from 'polished';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FormattedDate, FormattedMessage, FormattedNumber, useIntl } from 'react-intl';
import { useMeasure } from 'react-use';
import { ListChildComponentProps, VariableSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import { Coin } from '../../../components/Coin';
import { SwapStatus } from '../../../generated/skypools-graphql';
import { isFakeBtcToken } from '../../../modules/para-inch';
import { ParaInchHistoryItem, useParaInchHistory } from '../../../modules/para-inch-react';
import { shortenAddress } from '../../../modules/short-address';
import { size } from '../../../modules/styles';
import { buildLinkToTransaction } from '../../../modules/web3';

import {
  amountIn,
  amountOut,
  coinIn,
  coinOut,
  container,
  firstRow,
  hash,
  icon,
  iconCompleted,
  iconFailed,
  iconPending,
  lastRow,
  rowContainer,
  sizeCalc,
  status,
  time,
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

      <Link css={status} href={`/swap/${item.id}`} passHref>
        <a href={`/swap/${item.id}`}>
          <FormattedMessage id={`history.status.${item.status}`} />
        </a>
      </Link>
      <div css={time}>
        <FormattedDate
          value={DateTime.fromISO(item.createdAt).toJSDate()}
          year="numeric"
          month="short"
          day="2-digit"
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
            href={buildLinkToTransaction({ network: item.network, transactionHash: it })}
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
  const [itemHeightFirst, setItemHeightFirst] = useState<number>(size.city);
  const [itemHeightLast, setItemHeightLast] = useState<number>(size.city);
  const [itemHeightOther, setItemHeightOther] = useState<number>(size.city);
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('ltr');

  const { data: swapHistory, fetchMore } = useParaInchHistory();
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

  const itemCount = swapHistory?.swaps.totalCount ?? 0;

  return (
    <div css={container} className={className} ref={ref as any}>
      <div css={sizeCalc} ref={stylesRef} />
      <Context.Provider value={swaps}>
        <InfiniteLoader
          isItemLoaded={(index) => !!swaps[index]}
          itemCount={itemCount}
          loadMoreItems={async () => {
            if (!swapHistory || !fetchMore) return;
            await fetchMore({
              variables: { before: swapHistory.swaps.pageInfo.endCursor },
              updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!fetchMoreResult) return previousResult;
                return {
                  swaps: {
                    totalCount: fetchMoreResult.swaps.totalCount,
                    edges: [...previousResult.swaps.edges, ...fetchMoreResult.swaps.edges],
                    pageInfo: fetchMoreResult.swaps.pageInfo,
                  },
                };
              },
            });
          }}
        >
          {({ onItemsRendered, ref }) => (
            <List
              width={width}
              height={height}
              itemSize={itemSize}
              itemCount={itemCount}
              direction={direction}
              onItemsRendered={onItemsRendered}
              ref={ref}
            >
              {Row}
            </List>
          )}
        </InfiniteLoader>
      </Context.Provider>
    </div>
  );
};
