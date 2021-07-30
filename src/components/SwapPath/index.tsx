import React, { useMemo } from 'react';
import { useContainerQuery } from 'react-container-query';

import { Icon } from '../Icon';
import { Coin } from '../Coin';
import { SwapQuoteMutationResult } from '../../generated/skypools-graphql';

import { coin, swapPath, divider, wrapper } from './styles';
import { PlatformBox } from './PlatformBox';

type Props = {
  className?: string;
  value: NonNullable<SwapQuoteMutationResult['data']>['swapQuote']['bestRoute'];
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
        <Coin css={coin} src={value.path[0]?.[0]?.srcToken?.logoUri} />
        {value.path.map((it, index) => (
          <React.Fragment key={index}>
            <span css={divider}>
              <Icon.CaretRight />
            </span>

            <PlatformBox
              value={it}
              withFractions={!!params.withFractions}
              withNames={!!params.withNames}
            />

            <span css={divider}>
              <Icon.CaretRight />
            </span>

            <Coin css={coin} src={it[0]?.destToken?.logoUri} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
