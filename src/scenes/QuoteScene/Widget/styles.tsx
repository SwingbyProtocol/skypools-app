import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(7, min-content);
  grid-template-areas:
    'from-label'
    'from-input'
    'to-label'
    'to-input'
    'swap'
    'info';
`;

export const label = css`
  font-size: ${rem(size.closet)};
  font-weight: 500;
  color: hsl(var(--sp-color-text-masked));
  margin-block-end: ${rem(size.box)};
  align-self: flex-end;
`;

export const fromLabel = css`
  grid-area: from-label;
`;

export const toLabel = css`
  grid-area: to-label;
  margin-block-start: ${rem(size.street)};
`;

export const fromInput = css`
  grid-area: from-input;
`;

export const toInput = css`
  grid-area: to-input;
`;

export const swap = css`
  grid-area: swap;
  margin-block-start: ${rem(size.street)};
`;

export const info = css`
  grid-area: info;
  margin-block-start: ${rem(size.street)};
  border: 2px dashed hsl(var(--sp-color-border-normal));
  border-radius: ${rem(size.closet)};
  padding: ${rem(size.drawer)};
  font-size: ${rem(size.closet)};
  color: hsl(var(--sp-color-text-masked));
`;

export const infoLabel = css`
  vertical-align: top;
  text-align: start;
`;

export const infoValue = css`
  text-align: end;
`;

export const infoValueHighlight = css`
  color: hsl(var(--sp-color-text-normal));
`;
