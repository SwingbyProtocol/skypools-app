import { css } from '@linaria/core';
import { rem } from 'polished';

import { sizes } from '../../modules/styles';

export const swapPath = css`
  --coin-size: ${rem(sizes.state)};
  --coin-min-size: ${rem(sizes.room)};
  --border-color: var(--sp-color-primary-normal);
  --border-radius: ${rem(sizes.room)};
  --divider-size: ${rem(sizes.room)};
  --divider-min-size: ${rem(sizes.drawer)};
  --divider-gap: ${rem(sizes.box)};

  --platform-box-padding: ${rem(sizes.drawer)} ${rem(sizes.room)};
  --platform-box-min-padding: ${rem(sizes.box)} ${rem(sizes.box)};
  --platform-item-gap: ${rem(sizes.drawer)};
  --platform-name-gap: ${rem(sizes.box)};
  --platform-fraction-gap: ${rem(sizes.drawer)};
  --platform-logo-size: ${rem(sizes.street)};
  --platform-logo-min-size: ${rem(sizes.closet)};
  --platform-font-size: ${rem(sizes.room)};

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

export const wrapper = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  max-width: 100%;
`;

export const coin = css`
  font-size: var(--coin-size);
  min-width: var(--coin-min-size);
  flex-grow: 0;
  flex-shrink: 1;
`;

export const divider = css`
  color: var(--border-color);
  font-size: var(--divider-size);
  min-width: var(--divider-min-size);
  margin: 0 var(--divider-gap);
  flex-grow: 1;
  flex-shrink: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
`;
