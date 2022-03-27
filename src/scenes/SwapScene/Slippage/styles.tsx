import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../../modules/styles';

export const container = css`
  margin-block-start: ${rem(size.house)};
`;

export const label = css`
  font-size: ${rem(size.closet)};
  font-weight: 500;
  color: hsl(var(--sp-color-text-masked));
  margin-block-end: ${rem(size.box)};
  align-self: flex-end;
`;

export const selector = css`
  grid-column-gap: ${rem(size.drawer)};
  display: flex;
  justify-content: space-between;
`;

export const selectorButtonsWrapper = css`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 0;
`;

export const selectorButton = css`
  border: 1px solid hsl(var(--sp-color-border-normal));
  background: hsl(var(--sp-color-bg-accent));
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: ${rem(size.closet)};
  padding: ${rem(0)} ${rem(size.drawer)};

  :first-of-type {
    border-top-left-radius: ${rem(size.house)};
    border-bottom-left-radius: ${rem(size.house)};
    border-right: 0;
  }

  :last-of-type {
    border-top-right-radius: ${rem(size.house)};
    border-bottom-right-radius: ${rem(size.house)};
    border-left: 0;
  }
`;

export const selectorButtonActive = css`
  background-color: hsl(var(--sp-color-primary-active));
`;

export const textInput = css`
  width: ${rem(100)};

  input {
    text-align: end;
    font-size: ${rem(size.closet)};
  }
`;

export const inputRight = css`
  font-size: ${rem(size.closet)};
`;
