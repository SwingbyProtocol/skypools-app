import { css } from '@linaria/core';
import { transitions, rem } from 'polished';

import { size } from '../../modules/styles';

export const SIZES = ['country', 'state', 'city'] as const;
export type Size = typeof SIZES[number];

export const STATES = ['normal', 'danger'] as const;
export type State = typeof STATES[number];

export const container = css`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const label = css`
  display: block;
  font-size: ${rem(size.room)};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-weight: 500;
  margin-bottom: ${rem(size.drawer)};
`;

export const description = css`
  display: block;
  color: var(--sp-color-text-normal);
  font-size: ${rem(size.closet)};
  margin-top: ${rem(size.box)};
`;

export const inputContainer = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: var(--sp-color-bg-base);
  border: 2px solid transparent;
  color: var(--sp-color-text-normal);
  overflow: hidden;
  font-size: ${rem(size.house)};

  ${transitions(['color', 'background', 'border'], 'var(--sp-duration-normal) ease-in-out')};
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
  height: 100%;
  width: 100%;
  text-indent: ${rem(size.closet)};
  padding-right: ${rem(size.closet)};
  font-size: ${rem(size.room)};
  font-weight: 700;
  min-width: 0;
  ${transitions(['color'], 'var(--sp-duration-normal) ease-in-out')};

  ::placeholder {
    color: var(--sp-color-text-placeholder);
  }
`;

export const sizeCountry = css`
  border-radius: ${rem(size.room)};
  height: ${rem(size.country)};
`;

export const sizeState = css`
  border-radius: ${rem(size.room)};
  height: ${rem(size.state)};
`;

export const sizeCity = css`
  border-radius: ${rem(size.room)};
  height: ${rem(size.city)};
`;

export const stateNormal = css`
  border-color: var(--sp-color-border-normal);
`;

export const stateDanger = css`
  border-color: var(--sp-color-danger-normal);
`;

export const focused = css`
  border-color: var(--sp-color-primary-hover);
`;

export const left = css`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  margin-left: ${rem(size.room)};
`;

export const right = css`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  margin-right: ${rem(size.room)};
`;
