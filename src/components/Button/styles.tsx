import { css } from '@linaria/core';
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
  width: 100%;
`;

export const shapeFit = css`
  width: fit-content;
`;

export const sizeCountry = css`
  border-radius: ${rem(size.closet)};
  height: ${rem(size.country)};
  padding: 0 ${rem(size.house)};
`;

export const sizeState = css`
  border-radius: ${rem(size.closet)};
  height: ${rem(size.state)};
  padding: 0 ${rem(size.house)};
`;

export const sizeCity = css`
  border-radius: ${rem(size.closet)};
  font-size: ${rem(size.room)};
  height: ${rem(size.city)};
  padding: 0 ${rem(size.house)};
`;

export const sizeTown = css`
  border-radius: ${rem(size.closet)};
  font-size: ${rem(size.room)};
  height: ${rem(size.town)};
  padding: 0 ${rem(size.house)};
`;

export const sizeStreet = css`
  border-radius: ${rem(size.closet)};
  font-size: ${rem(size.closet)};
  height: ${rem(size.street)};
  padding: 0 ${rem(size.house)};
`;

export const variantPrimary = css`
  background: var(--sp-color-primary-normal);
  color: var(--sp-color-primary-text);

  :hover,
  :active {
    background: var(--sp-color-primary-active);
    color: var(--sp-color-primary-text);
  }
`;

export const variantSecondary = css`
  border: none;
  background: var(--sp-color-text-normal);
  color: $var(--sp-color-bg-normal);

  :hover,
  :active {
    background: var(--sp-color-text-masked);
    color: $var(--sp-color-bg-normal);
  }
`;

export const variantTertiary = css`
  border: 2px solid var(--sp-color-primary-normal);
  background: transparent;
  color: var(--sp-color-primary-normal);

  :hover,
  :active {
    background: var(--sp-color-primary-active);
    color: var(--sp-color-primary-text);
    border-color: transparent;
  }
`;

export const shadowBase = css`
  font-size: 1rem;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: ${em(size.closet)};
  pointer-events: none;
  user-select: none;
`;

export const shadowPrimary = css`
  color: var(--sp-color-primary-active);
`;

export const shadowSecondary = css`
  color: var(--sp-color-text-masked);
`;

export const shadowTertiary = css`
  color: var(--sp-color-primary-active);
`;

export const shadowCircle = css`
  border-radius: 50%;
`;
