import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const widgetsContainer = css`
  display: flex;
  justify-items: center;
`;

export const container = css`
  display: flex;
  flex-direction: column;
`;

export const fromAmount = css`
  display: flex;
  justify-content: space-between;
  margin-block-end: ${rem(size.street)};
`;

export const label = css`
  margin-block-end: ${rem(size.box)};
  display: flex;
  column-gap: ${rem(size.drawer)};
  align-items: center;
`;

export const max = css`
  text-decoration: underline;
  font-size: ${rem(size.room)};
  cursor: pointer;
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

export const historyContainer = css`
  grid-area: history;
  width: ${rem(250)};
  justify-self: center;
  margin-block-start: ${rem(size.house)};
  margin-block-end: ${rem(-size.town)};
  margin-block-end: calc(-1 * var(--sp-app-inset-bottom));
  @media (min-width: ${rem(768)}) {
    width: ${rem(340)};
  }
`;

export const historyBox = css`
  height: ${rem(170)};
`;

export const historyCard = css`
  height: ${rem(150)};
`;

export const error = css`
  margin-block-start: ${rem(size.drawer)};
  font-size: ${rem(size.room)};
  color: hsl(var(--sp-color-text-normal);
  border-radius: ${rem(size.box)};
  background-color: hsl(var(--sp-color-danger-normal));
  padding: ${rem(size.drawer)};
  overflow-wrap: break-word;
  max-width: ${rem(250)};
  @media (min-width: ${rem(1440)}) {
    max-width: ${rem(350)};
  }
`;

export const textInput = css`
  input {
    text-align: end;
  }
`;

export const explorer = css`
  margin-block-start: ${rem(size.drawer)};
  text-align: center;
`;

export const detailLink = css`
  color: hsl(var(--sp-color-primary-normal));
`;
