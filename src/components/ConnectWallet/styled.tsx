import { rem, transitions } from 'polished';
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
  margin-right: ${rem(size.drawer)};
`;

export const healthIndicator = css`
  width: ${rem(size.drawer)};
  height: ${rem(size.drawer)};
  border-radius: 50%;
  background: hsl(var(--sp-color-danger-normal));
  margin-right: ${rem(size.drawer)};
  ${transitions(['background'], 'var(--sp-duration-normal)')};
`;

export const healthy = css`
  background: hsl(var(--sp-color-success-normal));
`;
