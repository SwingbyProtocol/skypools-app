import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: minmax(${rem(size.room)}, auto) min-content min-content;
  align-items: center;
  justify-items: center;
  grid-column-gap: ${rem(size.closet)};
  grid-row-gap: ${rem(size.closet)};
  font-size: ${rem(size.closet)};

  @media (min-width: ${rem(768)}) {
    grid-template-columns: 1fr minmax(min-content, 1fr) min-content;
    grid-column-gap: ${rem(size.town)};
    font-size: ${rem(size.room)};
  }
`;

export const exchange = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  justify-self: start;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

export const exchangeLogo = css`
  flex-shrink: 0;
  margin-inline-end: ${rem(size.box)};
  font-size: ${rem(size.room)};

  @media (min-width: ${rem(768)}) {
    font-size: ${rem(size.town)};
  }
`;

export const exchangeName = css`
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const amount = css`
  font-feature-settings: 'tnum' 1;
  justify-self: end;
`;

export const comparison = css`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${rem(size.house / 2)};
  block-size: ${rem(size.house)};
  inline-size: 100%;
  padding-inline-start: ${rem(size.drawer)};
  padding-inline-end: ${rem(size.drawer)};
  font-size: ${rem(size.drawer)};

  @media (min-width: ${rem(768)}) {
    border-radius: ${rem(size.street / 2)};
    block-size: ${rem(size.street)};
    font-size: ${rem(size.closet)};
    padding-inline-start: ${rem(size.closet)};
    padding-inline-end: ${rem(size.closet)};
  }
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
