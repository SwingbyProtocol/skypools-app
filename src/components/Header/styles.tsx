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
  min-height: ${rem(80)};
  background: hsl(var(--sp-color-bg-normal));
  border-bottom: 1px solid hsl(var(--sp-color-border-normal));
  padding: 0 ${rem(size.town)};
  padding: 0 var(--sp-app-inset-right) 0 var(--sp-app-inset-left);
`;

export const logo = css`
  grid-area: logo;
  height: ${rem(size.state)};
  width: ${rem(size.state * (146 / 44))};
  position: relative;
`;

export const connect = css`
  grid-area: connect;
`;
