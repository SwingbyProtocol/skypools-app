import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  grid-template-areas: 'coin amount';
  grid-gap: ${rem(size.closet)};
`;

export const selectInput = css`
  grid-area: coin;
`;

export const textInput = css`
  grid-area: amount;
`;

export const coinContainer = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
`;

export const coinWrapper = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

export const coinChain = css`
  color: var(--coin-chain-color, hsl(var(--sp-color-text-masked)));
  font-size: ${rem(size.closet)};
  font-weight: 500;
  margin-bottom: ${rem(size.box)};
`;

export const coinName = css`
  color: var(--coin-name-color, hsl(var(--sp-color-text-normal)));
  font-size: ${rem(size.room)};
  font-weight: 700;
`;

export const coinLogo = css`
  font-size: ${rem(size.street)};
  margin-right: ${rem(size.box)};
`;
