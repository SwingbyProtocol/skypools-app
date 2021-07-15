import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: min-content auto;
  grid-template-areas: 'loading content';
  align-items: center;
  justify-items: start;
  background: hsla(var(--sp-color-warning-normal), 75%);
  padding-inline-start: ${rem(size.drawer)};
  padding-inline-end: ${rem(size.drawer)};
  padding-block-start: ${rem(size.box)};
  padding-block-end: ${rem(size.box)};
  border-radius: ${rem(size.drawer)};
  font-size: ${rem(size.closet)};
  margin-block-end: ${rem(size.street)};
`;

export const statusCompleted = css`
  background: hsla(var(--sp-color-success-normal), 75%);
`;

export const loading = css`
  grid-area: loading;
  margin-inline-end: ${rem(size.box)};
`;

export const content = css`
  grid-area: content;
`;
