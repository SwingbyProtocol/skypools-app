import { css } from '@emotion/react';
import { transitions, rem } from 'polished';

import { size } from '../../modules/styles';

export const SIZES = ['country', 'state', 'city'] as const;
export type Size = typeof SIZES[number];

export const STATES = ['normal', 'danger'] as const;
export type State = typeof STATES[number];

export const container = css`
  display: flex;
  flex-direction: column;
  inline-size: 100%;
`;

export const label = css`
  display: block;
  font-size: ${rem(size.room)};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-weight: 500;
  margin-block-end: ${rem(size.drawer)};
`;

export const description = css`
  display: block;
  color: hsl(var(--sp-color-text-normal));
  font-size: ${rem(size.closet)};
  margin-block-start: ${rem(size.box)};
`;

export const inputContainer = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: hsl(var(--sp-color-input-bg));
  border: 1px solid transparent;
  color: hsl(var(--sp-color-text-normal));
  overflow: hidden;
  font-size: ${rem(size.house)};
  ${transitions(['color', 'background', 'border'], 'var(--sp-duration-normal) ease-in-out')};

  :hover {
    border-color: hsl(var(--sp-color-border-hover));
  }

  :focus-within {
    border-color: hsl(var(--sp-color-primary-normal));
  }

  :focus-within:hover {
    border-color: hsl(var(--sp-color-primary-active));
  }
`;

export const inputContainerDisabled = css`
  background: hsla(var(--sp-color-input-bg), 75%);
  border-color: transparent;

  :hover,
  :focus-within,
  :focus-within:hover {
    border-color: transparent;
  }
`;

export const input = css`
  flex: 1;
  display: flex;
  margin: 0;
  padding: 0;
  outline: none;
  border: none;
  text-decoration: none;
  background: transparent;
  color: inherit;
  block-size: 100%;
  inline-size: 100%;
  text-indent: ${rem(size.closet)};
  padding-inline-end: ${rem(size.closet)};
  font-size: ${rem(size.room)};
  font-weight: 700;
  min-inline-size: 0;
  ${transitions(['color'], 'var(--sp-duration-normal) ease-in-out')};

  ::placeholder {
    color: hsl(var(--sp-color-text-placeholder));
  }
`;

export const sizeCountry = css`
  border-radius: ${rem(size.room)};
  block-size: ${rem(size.country)};
`;

export const sizeState = css`
  border-radius: ${rem(size.room)};
  block-size: ${rem(size.state)};
`;

export const sizeCity = css`
  border-radius: ${rem(size.room)};
  block-size: ${rem(size.city)};
`;

export const stateNormal = css`
  border-color: hsl(var(--sp-color-border-normal));
`;

export const stateDanger = css`
  border-color: hsl(var(--sp-color-danger-normal));
`;

export const focused = css`
  border-color: hsl(var(--sp-color-primary-active));
`;

export const left = css`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  margin-inline-start: ${rem(size.room)};
`;

export const right = css`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  margin-inline-end: ${rem(size.room)};
`;
