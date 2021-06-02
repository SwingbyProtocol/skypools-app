import { cx } from '@linaria/core';
import { rem } from 'polished';
import React, { useCallback } from 'react';
import { useSpring, animated } from 'react-spring';

import { size as styleSize } from '../../modules/styles';
import { Testable } from '../../modules/testing';

import {
  Size,
  Variant,
  Shape,
  buttonBase,
  variantPrimary,
  variantSecondary,
  variantTertiary,
  shadowBase,
  shadowCircle,
  shadowPrimary,
  shadowSecondary,
  shadowTertiary,
  shapeSquare,
  shapeCircle,
  shapeFill,
  shapeFit,
  sizeCountry,
  sizeState,
  sizeCity,
  sizeTown,
  sizeStreet,
} from './styles';

type Props = Omit<React.AllHTMLAttributes<HTMLElement>, 'size' | 'type'> &
  Testable & {
    size: Size;
    variant: Variant;
    shape?: Shape;
  };

export const Button = ({
  onClick,
  shape = 'fill',
  className,
  size,
  variant,
  style,
  ...props
}: Props) => {
  const Component = props.href ? 'a' : 'button';
  const [{ shadow, opacity }, set] = useSpring(() => ({
    from: { shadow: 0, opacity: 0.3 },
    shadow: 0,
    opacity: 0,
    reset: true,
  }));

  const click = useCallback<NonNullable<Props['onClick']>>(
    (evt) => {
      set({ shadow: 1, opacity: 0, reset: true });
      onClick?.(evt);
    },
    [onClick, set],
  );

  return (
    <Component
      role="button"
      {...props}
      onClick={click}
      className={cx(
        buttonBase,
        variant === 'primary' && variantPrimary,
        variant === 'secondary' && variantSecondary,
        variant === 'tertiary' && variantTertiary,
        shape === 'square' && shapeSquare,
        shape === 'circle' && shapeCircle,
        shape === 'fill' && shapeFill,
        shape === 'fit' && shapeFit,
        size === 'country' && sizeCountry,
        size === 'state' && sizeState,
        size === 'city' && sizeCity,
        size === 'town' && sizeTown,
        size === 'street' && sizeStreet,
        className,
      )}
      style={{
        width: shape === 'square' || shape === 'circle' ? rem(styleSize[size]) : undefined,
        ...style,
      }}
    >
      <animated.div
        className={cx(
          shadowBase,
          variant === 'primary' && shadowPrimary,
          variant === 'secondary' && shadowSecondary,
          variant === 'tertiary' && shadowTertiary,
          shape === 'circle' && shadowCircle,
        )}
        style={{
          opacity,
          boxShadow: shadow
            .to({ range: [0, 1], output: [0, 16] })
            .to((x) => `0 0 0 ${x}px currentColor`),
        }}
      />
      {props.children}
    </Component>
  );
};
