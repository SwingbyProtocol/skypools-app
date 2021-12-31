import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(7, min-content);
  grid-template-areas:
    'from-label'
    'from-input'
    'reverse'
    'to-label'
    'to-input'
    'address'
    'swap'
    'error'
    'info';
`;

export const label = css`
  font-size: ${rem(size.closet)};
  font-weight: 500;
  color: hsl(var(--sp-color-text-masked));
  margin-block-end: ${rem(size.box)};
  align-self: flex-end;
`;

export const fromLabel = css`
  grid-area: from-label;
`;

export const toLabel = css`
  grid-area: to-label;
  margin-block-start: ${rem(size.street)};
`;

export const fromInput = css`
  grid-area: from-input;
`;

export const toInput = css`
  grid-area: to-input;
`;

export const swap = css`
  grid-area: swap;
  margin-block-start: ${rem(size.street)};
`;

export const info = css`
  grid-area: info;
  margin-block-start: ${rem(size.street)};
  border: 2px dashed hsl(var(--sp-color-border-normal));
  border-radius: ${rem(size.closet)};
  padding: ${rem(size.drawer)};
  font-size: ${rem(size.closet)};
  color: hsl(var(--sp-color-text-masked));
`;

export const infoLabel = css`
  vertical-align: top;
  text-align: start;
`;

export const infoValue = css`
  text-align: end;
`;

export const error = css`
  grid-area: error;
  margin-block-start: ${rem(size.drawer)};
  font-size: ${rem(size.room)};
  color: hsl(var(--sp-color-danger-normal));
  overflow-wrap: break-word;
  max-width: ${rem(250)};
  @media (min-width: ${rem(1440)}) {
    max-width: ${rem(350)};
  }
`;

export const reverse = css`
  grid-area: reverse;
  display: flex;
  justify-content: center;
  text-align: center;
  margin-block-start: ${rem(-size.box)};
`;

export const direction = css`
  display: flex;
  justify-content: center;
  align-items: center;
  background: hsl(var(--sp-color-input-bg));
  cursor: pointer;
  width: ${rem(size.city)};
  height: ${rem(size.city)};
  border-radius: 100%;
  font-size: ${rem(size.house)};
`;

export const labelAddress = css`
  text-align: left;
  margin-block-end: ${rem(size.drawer)};
  font-size: ${rem(size.room)};
  color: hsl(var(--sp-color-text-masked));
`;

export const rowBtcAddress = css`
  grid-area: address;
  margin-block-start: ${rem(size.street)};
  margin-block-end: ${rem(size.drawer)};
  width: 100%;
`;

export const minimumReceivingValue = css`
  text-align: end;
`;

export const invalidAddressFormat = css`
  margin-block-start: ${rem(size.box / 2)};
  position: absolute;
  text-align: left;
  font-size: ${rem(size.room)};
  color: hsl(var(--sp-color-danger-normal));
`;

export const link = css`
  text-decoration: none;
`;

export const rowBalance = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: ${rem(size.drawer)};
  column-gap: ${rem(size.drawer)};
  padding-right: ${rem(size.box / 2)};
  font-size: ${rem(12)};
  color: hsl(var(--sp-color-text-masked));
`;

export const max = css`
  text-decoration: underline;
  cursor: pointer;
`;
