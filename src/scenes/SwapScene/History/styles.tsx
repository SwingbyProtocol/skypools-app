import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css``;

export const rowContainer = css`
  display: grid;
  align-items: center;
  grid-column-gap: ${rem(size.drawer)};
  grid-template-columns: min-content 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    'icon type amount-in hash'
    'icon time amount-out hash';
  overflow: hidden;
  white-space: nowrap;
  font-size: ${rem(size.closet)};
`;

export const icon = css`
  grid-area: icon;
  position: relative;
  width: ${rem(size.town)};
  height: ${rem(size.town)};
`;

export const type = css`
  grid-area: type;
  align-self: flex-end;
`;

export const time = css`
  grid-area: time;
  align-self: flex-start;
`;

export const amountIn = css`
  grid-area: amount-in;
  align-self: flex-end;
  justify-self: center;
`;

export const amountOut = css`
  grid-area: amount-out;
  align-self: flex-start;
  justify-self: center;
`;

export const hash = css`
  grid-area: hash;
  justify-self: flex-end;
`;
