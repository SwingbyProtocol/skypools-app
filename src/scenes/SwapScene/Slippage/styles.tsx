import { css } from '@emotion/react';
import styled from '@emotion/styled';
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

export const selects = css`
  grid-column-gap: ${rem(size.drawer)};
  display: flex;
  justify-content: space-between;
  @media (min-width: ${rem(400)}) {
    justify-content: flex-start;
  }
  @media (min-width: ${rem(768)}) {
    justify-content: space-between;
  }
  @media (min-width: ${rem(1100)}) {
    justify-content: flex-start;
  }
`;

export const buttons = css`
  display: grid;
  grid-template-columns: auto auto auto;
  border-radius: ${rem(size.house)};
  grid-column-gap: 0;
`;

export const Button = styled.div<{ isActive: boolean }>`
  width: ${rem(42)};
  border: 1px solid hsl(var(--sp-color-border-normal));
  background: hsl(var(--sp-color-bg-normal));
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: ${rem(size.closet)};
  background-color: ${(props) => props.isActive && 'hsl(var(--sp-color-border-normal))'};
  padding: ${rem(0)} ${rem(size.drawer)};
  @media (min-width: ${rem(375)}) {
    width: ${rem(46)};
  }
  @media (min-width: ${rem(400)}) {
    width: ${rem(size.state)};
  }
`;

export const buttonLeft = css`
  border-top-left-radius: ${rem(size.house)};
  border-bottom-left-radius: ${rem(size.house)};
  border-right: 0;
`;

export const buttonRight = css`
  border-top-right-radius: ${rem(size.house)};
  border-bottom-right-radius: ${rem(size.house)};
  border-left: 0;
`;

export const textInput = css`
  width: ${rem(98)};
  input {
    text-align: end;
    font-size: ${rem(size.closet)};
  }
`;

export const inputRight = css`
  font-size: ${rem(size.closet)};
`;
