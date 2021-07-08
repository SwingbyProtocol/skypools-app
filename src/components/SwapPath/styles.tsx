import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const swapPath = css`
  --coin-size: ${rem(size.state)};
  --coin-min-size: ${rem(size.room)};
  --border-color: hsl(var(--sp-color-primary-normal));
  --border-radius: ${rem(size.room)};
  --divider-size: ${rem(size.room)};
  --divider-min-size: ${rem(size.drawer)};
  --divider-gap: ${rem(size.box)};

  --platform-box-padding: ${rem(size.drawer)} ${rem(size.room)};
  --platform-box-min-padding: ${rem(size.box)} ${rem(size.box)};
  --platform-item-gap: ${rem(size.drawer)};
  --platform-name-gap: ${rem(size.box)};
  --platform-fraction-gap: ${rem(size.drawer)};
  --platform-logo-size: ${rem(size.street)};
  --platform-logo-min-size: ${rem(size.closet)};
  --platform-font-size: ${rem(size.room)};

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
  aspect-ratio: 1;
  height: auto;
`;

export const divider = css`
  color: var(--border-color);
  font-size: var(--divider-size);
  min-width: var(--divider-min-size);
  margin-block: 0;
  margin-inline: var(--divider-gap);
  flex-grow: 1;
  flex-shrink: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
`;
