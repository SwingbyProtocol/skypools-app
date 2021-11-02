import React, { useMemo } from 'react';
import { useContainerQuery } from 'react-container-query';

import { Icon } from '../Icon';
import { Coin } from '../Coin';
import { SwapQuoteQueryResult } from '../../generated/skypools-graphql';

import { coin, swapPath, divider, wrapper } from './styles';
import { PlatformBox } from './PlatformBox';

type Props = {
  className?: string;
  value: Pick<NonNullable<SwapQuoteQueryResult['data']>['swapQuote']['bestRoute'], 'path'>;
};

export const SwapPath = ({ value, className }: Props) => {
  const query = useMemo(
    () => ({
      withFractions: { minWidth: 120 * value.path?.length },
      withNames: { minWidth: 280 * value.path?.length },
    }),
    [value.path?.length],
  );

  const [params, containerRef] = useContainerQuery(query, {});

  return (
    <div ref={containerRef} css={swapPath} className={className}>
      <div css={wrapper}>
        {value.path.map((path, index) => (
          <React.Fragment key={index}>
            {path.swaps.map((swap, index) => (
              <React.Fragment key={index}>
                {index === 0 && <Coin css={coin} src={swap.srcToken?.logoUri} />}

                <span css={divider}>
                  <Icon.CaretRight />
                </span>

                <PlatformBox
                  value={swap.exchanges}
                  withFractions={!!params.withFractions}
                  withNames={!!params.withNames}
                />

                <span css={divider}>
                  <Icon.CaretRight />
                </span>

                <Coin css={coin} src={swap.destToken?.logoUri} />
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
