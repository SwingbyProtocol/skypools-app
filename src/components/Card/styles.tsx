import { css } from '@linaria/core';
import { rem } from 'polished';

import { sizes } from '../../modules/styles';

export const card = css`
  background: var(--sp-color-bg-normal);
  border: 1px solid var(--sp-color-border-normal);
  border-radius: ${rem(sizes.room)};
`;
