import React from 'react';
import { BigSource } from 'big.js';
import { useContainerQuery } from 'react-container-query';

import { Icon } from '../Icon';
import { Coin } from '../Coin';

import { coin, swapPath, divider, wrapper } from './styles';
import { PlatformBox } from './PlatformBox';

type PathItem = {
  toCoin: string;
  via: Array<{ platform: string; fraction: BigSource }>;
};

type Props = {
  className?: string;
  initialCoin: string;
  value: PathItem[];
};

export const SwapPath = ({ initialCoin, value = [], className }: Props) => {
  const [params, containerRef] = useContainerQuery(
    {
      withFractions: { minWidth: 120 * value.length },
      withNames: { minWidth: 280 * value.length },
    },
    {},
  );

  return (
    <div ref={containerRef} css={swapPath} className={className}>
      <div css={wrapper}>
        <Coin css={coin} src={`/swap/coins/${initialCoin}.svg`} />
        {value.map((it) => (
          <React.Fragment key={it.toCoin}>
            <span css={divider}>
              <Icon.CaretRight />
            </span>

            <PlatformBox
              value={it.via}
              withFractions={!!params.withFractions}
              withNames={!!params.withNames}
            />

            <span css={divider}>
              <Icon.CaretRight />
            </span>

            <Coin css={coin} src={`/swap/coins/${it.toCoin}.svg`} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
