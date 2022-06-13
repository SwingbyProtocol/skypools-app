import styled from '@emotion/styled';

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

export const ConnectButton = styled.button<{ variant: 'small' | 'big' | 'normal' }>`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${({ variant }) => (variant === 'small' ? '12px' : '16px')};
  text-align: center;
  white-space: nowrap;
  margin-right: 16px;

  border: 1px solid transparent;

  padding: ${({ variant }) => {
    switch (variant) {
      case 'small':
        return '9px 24px';
      case 'big':
        return '19px 48px';
      default:
        // Its also normal
        return '11px 32px';
    }
  }};

  &:disabled {
    cursor: not-allowed;
    pointer-events: none;
  }

  --theme-blue400-rgb: 114, 136, 234; // blue400
  --theme-blue500-rgb: 79, 106, 230; // blue500
  --theme-blue600-rgb: 51, 90, 222; // blue600

  background-color: rgb(var(--theme-blue500-rgb));
  box-shadow: 0 8px 16px rgba(var(--theme-blue500-rgb), 0.16);
  border-radius: 4px;
  color: #fff;

  &:hover {
    background-color: rgb(var(--theme-blue400-rgb));
    color: #fff;
    box-shadow: 0 8px 16px rgba(var(--theme-blue400-rgb), 0.24);
  }

  &:active {
    background-color: rgb(var(--theme-blue600-rgb));
    box-shadow: 0 4px 8px rgba(var(--theme-blue600-rgb), 0.16);
    color: #fff;
  }
`;
