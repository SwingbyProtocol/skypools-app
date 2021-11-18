import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  text-align: center;
  row-gap: ${rem(size.house)};
  grid-template-rows: repeat(2, min-content);
  grid-template-areas:
    'confirmed'
    'claim';
`;

export const confirmed = css`
  grid-area: confirmed;
  font-weight: 700;
  color: hsl(var(--sp-color-primary-normal));
  margin-bottom: ${rem(size.drawer)};
`;

export const claim = css`
  grid-area: claim;
  width: 100%;
`;

export const claimNote = css`
  margin-bottom: ${rem(size.drawer)};
`;
