import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const float = css`
  display: none;
  @media (min-width: ${rem(768)}) {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: ${rem(size.box)};
    font-size: ${rem(size.closet)};
  }
`;

export const floatTitle = css`
  font-size: ${rem(size.house)};
  white-space: nowrap;
`;

export const floatRow = css`
  display: flex;
  column-gap: ${rem(size.street)};
  align-items: center;
`;

export const floatColumn = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: ${rem(size.box)};
`;
