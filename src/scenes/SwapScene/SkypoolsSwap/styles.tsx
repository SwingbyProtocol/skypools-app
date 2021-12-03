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
    'claim'
    'details';
`;

export const confirmed = css`
  grid-area: confirmed;
  font-weight: 700;
  color: hsl(var(--sp-color-primary-normal));
  margin-block-end: ${rem(size.drawer)};
`;

export const claim = css`
  grid-area: claim;
  width: 100%;
  margin-block-end: ${rem(size.drawer)};
`;

export const details = css`
  grid-area: details;
  width: 100%;
  margin-block-end: ${rem(size.drawer)};
  display: flex;
  flex-direction: column;
  row-gap: ${rem(size.drawer)};
  border: 2px dashed hsl(var(--sp-color-border-normal));
  border-radius: ${rem(size.closet)};
  padding: ${rem(size.drawer)};
  font-size: ${rem(size.closet)};
  color: hsl(var(--sp-color-text-masked));
`;

export const row = css`
  display: flex;
  justify-content: space-between;
`;
