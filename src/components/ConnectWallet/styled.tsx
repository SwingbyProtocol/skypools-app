import { rem } from 'polished';
import { css } from '@emotion/react';

import { size } from '../../modules/styles';

const MEDIA = `(min-width: ${rem(500)})`;

export const container = css`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  justify-content: center;

  @media ${MEDIA} {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }
`;

export const walletWrapper = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

export const networkTag = css`
  margin: auto;
`;

export const addressStyle = css`
  font-size: ${rem(size.closet)};
  letter-spacing: 0.03rem;
`;
