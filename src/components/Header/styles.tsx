import { css } from '@linaria/core';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const header = css`
  min-height: ${rem(80)};
  background: var(--sp-color-bg-normal);
  border-bottom: 1px solid var(--sp-color-border-normal);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 ${rem(size.town)};
`;

export const logo = css`
  height: ${rem(size.state)};
`;
