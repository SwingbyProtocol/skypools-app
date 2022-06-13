import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const floatsContainer = css`
  display: none;
  @media (min-width: ${rem(768)}) {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: ${rem(size.box)};
    font-size: ${rem(size.closet)};
    margin-right: ${rem(size.street)};
  }
`;

export const floatsTitle = css`
  font-size: ${rem(size.room)};
  white-space: nowrap;
`;

export const floatsRow = css`
  display: flex;
  column-gap: ${rem(size.street)};
  align-items: center;
`;
