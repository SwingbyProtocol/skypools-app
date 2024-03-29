import { em, transitions, transparentize } from 'polished';
import { css } from '@emotion/react';

import { darkTheme, size } from '../../modules/styles';

const COLOR_ETH = '#8892b5';

export const eth = css`
  ${darkTheme};

  background: ${COLOR_ETH};
  color: hsl(var(--sp-color-text-normal));
`;

export const ropsten = css`
  ${darkTheme};

  background: ${transparentize(0.5, COLOR_ETH)};
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 5px,
    ${COLOR_ETH} 5px,
    ${COLOR_ETH} 10px
  );
  color: hsl(var(--sp-color-text-normal));
`;

export const container = css`
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: ${em(size.street, size.closet)};
  border-radius: ${em(size.street / 2, size.closet)};
  padding-block: 0;
  padding-inline: ${em(size.closet, size.closet)};
  background: hsl(var(--sp-color-danger-normal));
  color: hsl(var(--sp-color-danger-text));
  font-size: ${em(size.closet)};
  font-weight: 600;
  user-select: none;
  cursor: auto;
  word-break: keep-all;
  white-space: nowrap;
  ${transitions(['color', 'background'], 'var(--sp-duration-normal)')};
`;
