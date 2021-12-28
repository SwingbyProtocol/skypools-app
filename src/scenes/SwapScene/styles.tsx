import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const swapPathContainer = css`
  background: hsl(var(--sp-color-bg-accent));
  padding-block: ${rem(size.street)};
  padding-inline: ${rem(size.town)};
`;

export const otherExchanges = css`
  padding: ${rem(size.town)};
`;
