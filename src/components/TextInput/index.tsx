import React, { useCallback, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { cx } from '@linaria/core';

import { Testable, useBuildTestId } from '../../modules/testing';

import {
  description as descriptionClass,
  State,
  left as leftClass,
  right as rightClass,
  Size,
  label as labelClass,
  container,
  inputContainer,
  input,
  focused,
  sizeCity,
  sizeCountry,
  sizeState,
  stateDanger,
  stateNormal,
} from './styles';

export type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'value' | 'size'
> &
  Testable & {
    label?: React.ReactNode;
    description?: React.ReactNode;
    state?: State;
    value: NonNullable<React.InputHTMLAttributes<HTMLInputElement>['value']>;
    left?: React.ReactNode;
    right?: React.ReactNode;
    size: Size;
  };

export const TextInput = ({
  className,
  label,
  description,
  'data-testid': testId,
  onFocus,
  onBlur,
  state = 'normal',
  left,
  right,
  size,
  id: idProp,
  ...props
}: Props) => {
  const { buildTestId } = useBuildTestId({ id: testId });
  const id = useMemo(() => idProp || `id-${nanoid()}`, [idProp]);
  const [isFocused, setFocused] = useState(false);

  const focus = useCallback<NonNullable<Props['onFocus']>>(
    (evt) => {
      setFocused(true);
      onFocus?.(evt);
    },
    [onFocus],
  );

  const blur = useCallback<NonNullable<Props['onBlur']>>(
    (evt) => {
      setFocused(false);
      onBlur?.(evt);
    },
    [onBlur],
  );

  return (
    <div className={cx(container, className)} data-testid={testId}>
      {!!label && (
        <label className={labelClass} htmlFor={id} data-testid={buildTestId('label')}>
          {label}
        </label>
      )}
      <div
        className={cx(
          inputContainer,
          isFocused && focused,
          state === 'normal' && stateNormal,
          state === 'danger' && stateDanger,
          size === 'city' && sizeCity,
          size === 'country' && sizeCountry,
          size === 'state' && sizeState,
        )}
      >
        {left && (
          <div className={leftClass} data-testid={buildTestId('left')}>
            {left}
          </div>
        )}
        <input
          {...props}
          className={input}
          data-testid={buildTestId('native-input')}
          id={id}
          onFocus={focus}
          onBlur={blur}
        />
        {right && (
          <div className={rightClass} data-testid={buildTestId('right')}>
            {right}
          </div>
        )}
      </div>
      {!!description && (
        <span className={descriptionClass} data-testid={buildTestId('description')}>
          {description}
        </span>
      )}
    </div>
  );
};
