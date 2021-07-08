import { css } from '@emotion/react';
import { em, rem, transitions } from 'polished';

import { size } from '../../modules/styles';

export const VARIANTS = ['primary', 'secondary', 'tertiary'] as const;
export type Variant = typeof VARIANTS[number];

export const SIZES = ['country', 'state', 'city', 'town', 'street'] as const;
export type Size = typeof SIZES[number];

export const SHAPES = ['fill', 'square', 'circle', 'fit'] as const;
export type Shape = typeof SHAPES[number];

export const buttonBase = css`
  align-items: center;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: 1em;
  font-weight: 700;
  justify-content: center;
  outline: none;
  position: relative;
  text-decoration: none;
  flex-shrink: 0;
  ${transitions(['background', 'color'], 'var(--sp-duration-normal)')};

  :disabled {
    opacity: 0.3;
    pointer-events: none;
  }
`;

export const shapeSquare = css`
  padding: 0;
  flex-shrink: 0;
  flex-grow: 0;
`;

export const shapeCircle = css`
  padding: 0;
  border-radius: 50%;
  flex-shrink: 0;
  flex-grow: 0;
`;

export const shapeFill = css`
  inline-size: 100%;
`;

export const shapeFit = css`
  inline-size: fit-content;
`;

export const sizeCountry = css`
  border-radius: ${rem(size.closet)};
  block-size: ${rem(size.country)};
  padding-block: 0;
  padding-inline: ${rem(size.house)};
`;

export const sizeState = css`
  border-radius: ${rem(size.closet)};
  block-size: ${rem(size.state)};
  padding-block: 0;
  padding-inline: ${rem(size.house)};
`;

export const sizeCity = css`
  border-radius: ${rem(size.closet)};
  font-size: ${rem(size.room)};
  block-size: ${rem(size.city)};
  padding-block: 0;
  padding-inline: ${rem(size.house)};
`;

export const sizeTown = css`
  border-radius: ${rem(size.closet)};
  font-size: ${rem(size.room)};
  block-size: ${rem(size.town)};
  padding-block: 0;
  padding-inline: ${rem(size.house)};
`;

export const sizeStreet = css`
  border-radius: ${rem(size.closet)};
  font-size: ${rem(size.closet)};
  block-size: ${rem(size.street)};
  padding-block: 0;
  padding-inline: ${rem(size.house)};
`;

export const variantPrimary = css`
  background: hsl(var(--sp-color-primary-normal));
  color: hsl(var(--sp-color-primary-text));

  :hover,
  :active {
    background: hsl(var(--sp-color-primary-active));
    color: hsl(var(--sp-color-primary-text));
  }
`;

export const variantSecondary = css`
  border: none;
  background: hsl(var(--sp-color-text-normal));
  color: hsl(var(--sp-color-bg-normal));

  :hover,
  :active {
    background: hsl(var(--sp-color-text-masked));
    color: hsl(var(--sp-color-bg-normal));
  }
`;

export const variantTertiary = css`
  border: 2px solid hsl(var(--sp-color-primary-normal));
  background: transparent;
  color: hsl(var(--sp-color-primary-normal));

  :hover,
  :active {
    background: hsl(var(--sp-color-primary-active));
    color: hsl(var(--sp-color-primary-text));
    border-color: transparent;
  }
`;

export const shadowBase = css`
  font-size: 1rem;
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 100%;
  block-size: 100%;
  border-radius: ${em(size.closet)};
  pointer-events: none;
  user-select: none;
`;

export const shadowPrimary = css`
  color: hsl(var(--sp-color-primary-active));
`;

export const shadowSecondary = css`
  color: hsl(var(--sp-color-text-masked));
`;

export const shadowTertiary = css`
  color: hsl(var(--sp-color-primary-active));
`;

export const shadowCircle = css`
  border-radius: 50%;
`;
