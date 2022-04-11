import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const modalContainer = css`
  background-color: rgba(0, 0, 0, 0.623);
  -webkit-transition: 0.5s;
  overflow: auto;
  transition: all 0.3s linear;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
`;

export const buttonContainer = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.295);
  border-radius: ${rem(size.drawer)};
  padding: ${rem(size.street)};

  p {
    font-size: ${rem(size.room)};
  }
`;

export const button = css`
  margin: ${rem(size.closet)};
`;
