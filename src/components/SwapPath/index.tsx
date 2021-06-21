import React from 'react';
import { useContainerQuery } from 'react-container-query';

import { Icon } from '../Icon';
import { Coin } from '../Coin';
import type { SwapQuoteRoute } from '../../modules/1inch';

import { coin, swapPath, divider, wrapper } from './styles';
import { PlatformBox } from './PlatformBox';

type Props = {
  className?: string;
  value: SwapQuoteRoute;
};

export const SwapPath = ({ value = { path: [] }, className }: Props) => {
  const [params, containerRef] = useContainerQuery(
    {
      withFractions: { minWidth: 120 * value.path.length },
      withNames: { minWidth: 280 * value.path.length },
    },
    {},
  );

  return (
    <div ref={containerRef} css={swapPath} className={className}>
      <div css={wrapper}>
        <Coin css={coin} src={value.path[0]?.[0]?.fromToken?.logoUri} />
        {value.path.map((it, index) => (
          <React.Fragment key={index}>
            <span css={divider}>
              <Icon.CaretRight />
            </span>

            <PlatformBox
              value={it.map((it) => ({ platform: it.exchange, fraction: it.fraction }))}
              withFractions={!!params.withFractions}
              withNames={!!params.withNames}
            />

            <span css={divider}>
              <Icon.CaretRight />
            </span>

            <Coin css={coin} src={it[0]?.toToken?.logoUri} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
