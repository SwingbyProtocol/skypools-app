import styled from 'styled-components';

export const Base = styled.a<{ size: 'small' | 'normal' | 'big'; iconOnly: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;

  border: 1px solid transparent;

  padding: ${({ size, iconOnly }) => {
    switch (size) {
      case 'small':
        return '9px' + (!iconOnly ? ' 24px' : '');
      case 'normal':
        return '11px' + (!iconOnly ? ' 32px' : '');
      case 'big':
        return '19px' + (!iconOnly ? ' 48px' : '');
    }
  }};

  &:disabled,
  &[disabled],
  &[aria-disabled='true'],
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const GhostAlt = styled(Base)`
  border: 1px solid ${({ theme }) => theme.pulsar.color.border.normal};
  background-color: transparent;
  border-radius: 4px;

  color: ${({ theme }) => theme.pulsar.color.text.masked};

  &:hover {
    background-color: ${({ theme }) => theme.pulsar.color.bg.hover};
    border: 1px solid currentColor;
    color: ${({ theme }) => theme.pulsar.color.text.normal};
  }

  &:active {
    background-color: ${({ theme }) => theme.pulsar.color.bg.accent};
    border: 1px solid currentColor;
    color: ${({ theme }) => theme.pulsar.color.text.normal};
  }

  &:disabled,
  &[disabled],
  &[aria-disabled='true'],
  &.disabled {
    background: rgba(170, 175, 179, 0.08);
    border-color: ${({ theme }) => theme.pulsar.color.border.normal};
    color: ${({ theme }) => theme.pulsar.color.text.placeholder};
  }
`;

export const TextAlt = styled(Base)`
  color: ${({ theme }) => theme.pulsar.color.text.placeholder};
  border: 0;
  background-color: transparent;
  padding: 0;

  display: inline-flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.pulsar.color.text.normal};
  }

  &:active {
    color: ${({ theme }) => theme.pulsar.color.text.normal};
  }

  &:disabled,
  &[disabled],
  &[aria-disabled='true'],
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    color: ${({ theme }) => theme.pulsar.color.text.masked};
  }
`;

export const SvgIcon = styled.svg`
  color: ${({ color, theme }) => {
    switch (color) {
      case 'primary':
        return theme.pulsar.color.primary.normal;
      case 'secondary':
        return theme.pulsar.color.secondary.normal;
      case 'red':
        return theme.pulsar.color.danger.normal;
      case 'green':
        return theme.pulsar.color.success.normal;
      case 'blue':
        return theme.pulsar.color.warning.normal;
      case 'inherit':
        return 'inherit';
      default:
        return theme.pulsar.color.text.normal;
    }
  }};
`;
