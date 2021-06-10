import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const header = css`
  min-height: ${rem(80)};
  background: hsl(var(--sp-color-bg-normal));
  border-bottom: 1px solid hsl(var(--sp-color-border-normal));
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 ${rem(size.town)};
`;

export const logo = css`
  height: ${rem(size.state)};
`;
