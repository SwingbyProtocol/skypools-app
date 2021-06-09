import { css } from '@linaria/core';
import { rem } from 'polished';

import { size } from '../../../../modules/styles';

export const coinContainer = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

export const coinWrapper = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

export const coinChain = css`
  color: var(--coin-chain-color, hsl(var(--sp-color-text-masked)));
  font-size: ${rem(size.closet)};
  font-weight: 500;
  margin-bottom: ${rem(size.box)};
`;

export const coinName = css`
  color: var(--coin-name-color, hsl(var(--sp-color-text-normal)));
  font-size: ${rem(size.room)};
  font-weight: 700;
`;

export const coinLogo = css`
  font-size: ${rem(size.street)};
  margin-right: ${rem(size.box)};
`;
