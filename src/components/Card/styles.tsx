import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const card = css`
  background: rgba(92, 150, 218, 0.2);
  box-shadow: inset #a2c6fb85 1px 1px 11px;
  border-radius: ${rem(size.house)};
`;
