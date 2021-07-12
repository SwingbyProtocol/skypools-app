import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: 1fr minmax(min-content, 1fr) min-content;
  align-items: center;
  justify-items: center;
  grid-column-gap: ${rem(size.town)};
  grid-row-gap: ${rem(size.closet)};
  font-size: ${rem(size.room)};
`;

export const exchange = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  justify-self: start;
`;

export const exchangeLogo = css`
  margin-inline-end: ${rem(size.box)};
  font-size: ${rem(size.town)};
`;

export const amount = css`
  font-feature-settings: 'tnum' 1;
  justify-self: end;
`;

export const comparison = css`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${rem(size.street / 2)};
  block-size: ${rem(size.street)};
  inline-size: 100%;
  padding-inline-start: ${rem(size.closet)};
  padding-inline-end: ${rem(size.closet)};
`;

export const comparisonMatch = css`
  background: hsla(var(--sp-color-success-normal), 75%);
  color: hsla(var(--sp-color-success-text));
`;

export const comparisonBetter = css`
  ${comparisonMatch}
`;

export const comparisonWorse = css`
  background: hsla(var(--sp-color-danger-normal), 75%);
  color: hsla(var(--sp-color-danger-text));
`;
