import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(5, min-content);
  grid-template-areas:
    'from-label'
    'from-input'
    'to-label'
    'to-input'
    'swap';
`;

export const label = css`
  font-size: ${rem(size.closet)};
  font-weight: 500;
  color: hsl(var(--sp-color-text-masked));
  margin-bottom: ${rem(size.box)};
  align-self: flex-end;
`;

export const fromLabel = css`
  grid-area: from-label;
`;

export const toLabel = css`
  grid-area: to-label;
  margin-top: ${rem(size.street)};
`;

export const fromInput = css`
  grid-area: from-input;
`;

export const toInput = css`
  grid-area: to-input;
`;

export const swap = css`
  grid-area: swap;
  margin-top: ${rem(size.street)};
`;
