import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  text-align: center;
  row-gap: ${rem(size.house)};
  grid-template-rows: repeat(2, min-content);
`;
