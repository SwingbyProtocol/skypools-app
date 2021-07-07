import { css } from '@emotion/react';
import { rem } from 'polished';

import { pulseAnimation, size } from '../../../modules/styles';

export const container = css``;

export const sizeCalc = css`
  pointer-events: none;
  user-select: none;
  position: absolute;
  left: 9999;
  height: ${rem(size.city)};
  // Calculating size for the first item. We are compensating the grid-gap and the rounded corner of the widget.
  margin-top: ${rem(size.city + size.town + size.room)};
  // Calculating size for the last item. We are compensating the grid-gap.
  margin-bottom: max(${rem(size.city + size.town)}, var(--sp-app-inset-bottom));
`;

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
  border-bottom: 1px solid hsl(var(--sp-color-border-normal));
`;

export const firstRow = css`
  padding-top: ${rem(size.town + size.room)};
`;

export const lastRow = css`
  padding-bottom: ${rem(size.town)};
  padding-bottom: var(--sp-app-inset-bottom);
  border-bottom: none;
`;

export const icon = css`
  grid-area: icon;
  position: relative;
  width: ${rem(size.town)};
  height: ${rem(size.town)};
  border-radius: ${rem(size.drawer)};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${rem(size.house)};
  background: #f00;
  color: #0f0;
`;

export const iconConfirmed = css`
  background: hsl(var(--sp-color-success-normal));
  color: hsl(var(--sp-color-success-text));
`;

export const iconSent = css`
  ${iconConfirmed};
  ${pulseAnimation};
`;

export const iconPending = css`
  background: hsla(var(--sp-color-warning-normal));
  color: hsla(var(--sp-color-warning-text));
  ${pulseAnimation};
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
