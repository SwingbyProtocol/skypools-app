import { useMeasure } from 'react-use';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import Image from 'next/image';
import { FormattedDate, FormattedNumber, useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import { size } from '../../../modules/styles';

import { amountIn, amountOut, container, hash, icon, rowContainer, time, type } from './styles';

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

const Row = ({ style }: ListChildComponentProps) => {
  const { formatNumber } = useIntl();
  return (
    <div css={rowContainer} style={style}>
      <div css={icon}>
        <Image src="/swap/swap-icon.svg" layout="fill" />
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

      <div css={hash}>0x000…</div>
    </div>
  );
};

export const History = ({ className }: Props) => {
  const [ref, { width, height }] = useMeasure();

  return (
    <div css={container} className={className} ref={ref as any}>
      <List width={width} height={height} itemSize={size.city} itemCount={1000}>
        {Row}
      </List>
    </div>
  );
};
