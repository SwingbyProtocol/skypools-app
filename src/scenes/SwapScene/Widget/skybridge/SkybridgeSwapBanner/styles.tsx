import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: min-content auto;
  grid-template-areas: 'loading content unlink';
  align-items: center;
  justify-items: start;
  background: hsla(var(--sp-color-warning-normal), 75%);
  color: hsl(var(--sp-color-warning-text));
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
  color: hsl(var(--sp-color-success-text));
`;

export const statusFailed = css`
  background: hsla(var(--sp-color-danger-normal), 75%);
  color: hsl(var(--sp-color-danger-text));
`;

export const loading = css`
  grid-area: loading;
  margin-inline-end: ${rem(size.box)};
`;

export const content = css`
  grid-area: content;
`;

export const unlink = css`
  grid-area: unlink;
  justify-self: end;
  align-self: flex-start;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  margin: 0;
  block-size: ${rem(size.room)};
  inline-size: ${rem(size.room)};
  font-size: ${rem(size.drawer)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
