import React, { useMemo } from 'react';
import { useContainerQuery } from 'react-container-query';

import { Icon } from '../Icon';
import { Coin } from '../Coin';
import type { SwapQuoteRoute } from '../../modules/para-inch';
import { useParaInch } from '../../modules/para-inch-react';

import { coin, swapPath, divider, wrapper } from './styles';
import { PlatformBox } from './PlatformBox';

type Props = {
  className?: string;
  value: SwapQuoteRoute;
};

export const SwapPath = ({ value: valueParam = { path: [] }, className }: Props) => {
  const { tokens } = useParaInch();

  const query = useMemo(
    () => ({
      withFractions: { minWidth: 120 * valueParam.path?.length },
      withNames: { minWidth: 280 * valueParam.path?.length },
    }),
    [valueParam.path?.length],
  );

  const [params, containerRef] = useContainerQuery(query, {});

  const value = useMemo(
    () => ({
      ...valueParam,
      path: valueParam.path.map((it) =>
        it.map((it) => ({
          ...it,
          platform: it.exchange,
          fraction: it.fraction,
          fromTokenLogo:
            tokens.find(
              ({ address }) => address.toLowerCase() === it.fromTokenAddress.toLowerCase(),
            )?.logoUri ?? null,
          toTokenLogo:
            tokens.find(({ address }) => address.toLowerCase() === it.toTokenAddress.toLowerCase())
              ?.logoUri ?? null,
        })),
      ),
    }),
    [valueParam, tokens],
  );

  return (
    <div ref={containerRef} css={swapPath} className={className}>
      <div css={wrapper}>
        <Coin css={coin} src={value.path[0]?.[0]?.fromTokenLogo} />
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

            <Coin css={coin} src={it[0]?.toTokenLogo} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
