import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const header = css`
  display: grid;
  grid-gap: ${rem(size.town)};
  grid-template-columns: 1fr min-content;
  grid-template-areas: 'logo connect';
  align-items: center;
  justify-items: start;
  min-block-size: ${rem(80)};
  background: hsl(var(--sp-color-bg-normal));
  border-block-end: 1px solid hsl(var(--sp-color-border-normal));
  padding-block: 0;
  padding-inline: ${rem(size.town)};
  padding-inline-start: var(--sp-app-inset-right);
  padding-inline-end: var(--sp-app-inset-right);
`;

export const logo = css`
  grid-area: logo;
  block-size: ${rem(size.state)};
  inline-size: ${rem(size.state * (146 / 44))};
  position: relative;
`;

export const connect = css`
  grid-area: connect;
`;
