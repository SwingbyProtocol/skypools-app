import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const floatsColumn = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: ${rem(size.box)};
`;
