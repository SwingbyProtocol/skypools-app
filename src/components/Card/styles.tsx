import { css } from '@linaria/core';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const card = css`
  background: hsl(var(--sp-color-bg-normal));
  border: 1px solid hsl(var(--sp-color-border-normal));
  border-radius: ${rem(size.room)};
  overflow: hidden;
`;
