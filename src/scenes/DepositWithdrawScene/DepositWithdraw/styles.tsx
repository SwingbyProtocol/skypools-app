import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  row-gap: ${rem(size.house)};
  grid-template-rows: repeat(2, min-content);
`;

export const fromAmount = css`
  display: flex;
  justify-content: space-between;
  margin-block-end: ${rem(size.street)};
`;

export const label = css`
  margin-block-end: ${rem(size.box)};
`;

export const rowDepositBalance = css`
  display: flex;
  justify-content: space-between;
  margin-block-end: ${rem(size.street)};
`;

export const buttonContainer = css`
  display: flex;
  justify-content: center;
`;
