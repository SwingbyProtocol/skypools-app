import { css } from '@linaria/core';
import { rem } from 'polished';

import { sizes } from '../../../modules/styles';

export const container = css`
  background: var(--sp-color-bg-accent);
  border-radius: ${rem(sizes.closet)};
  padding: ${rem(sizes.box)} ${rem(sizes.drawer)};
  border: var(--sp-tooltip-border);
  box-shadow: var(--sp-tooltip-shadow);
`;

export const dateLocal = css`
  font-size: ${rem(sizes.closet)};
  font-weight: 600;
`;

export const dateUtc = css`
  font-size: ${rem(sizes.drawer)};
  color: var(--sp-color-text-masked);
  font-weight: 500;
`;

export const price = css`
  white-space: nowrap;
  margin-top: ${rem(sizes.closet)};
  font-size: ${rem(sizes.room)};
  font-weight: 600;
`;

export const priceMasked = css`
  color: var(--sp-color-text-masked);
  font-weight: 500;
  font-size: ${rem(sizes.closet)};
`;
