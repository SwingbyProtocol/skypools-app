import styled from 'styled-components';
import { Icon } from '@swingby-protocol/pulsar';

export const Header = styled.header`
  align-items: center;
  background: ${({ theme }) => theme.pulsar.color.bg.normal};
  border-bottom: 1px solid ${({ theme }) => theme.pulsar.color.border.normal};
  display: flex;
  height: 72px;
  padding: 12px 64px;
  position: sticky;
  top: 0;
  z-index: 3;

  @media (max-width: 768px) {
    padding: 24px;
  }

  > div {
    position: inherit;
    > div {
      border-width: 0px;
      width: auto;
    }
  }
`;

export const BurgerButton = styled.button`
  cursor: pointer;
  @media (max-width: 768px) {
    visibility: visible;
    margin-right: 16px;
    border: 0;
    background: transparent;
  }

  @media (min-width: 769px) {
    visibility: hidden;
    position: absolute;
    top: 24px;
    left: -24px;
    z-index: 4;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    transform: translateX(50%);
    border: 1px solid ${({ theme }) => theme.pulsar.color.border.normal};
    border-radius: 50%;
    background-color: ${({ theme }) => theme.pulsar.color.bg.normal};
  }
`;

export const Tittle = styled.h3`
  margin-right: 16px;
  margin-left: 16px;
  white-space: nowrap;
  font-weight: 400;
  color: ${({ theme }) => theme.pulsar.color.text.normal};
`;

export const ArrowIcon = styled(Icon.ArrowRight)<{ navOpen: boolean }>`
  transform: rotate(${(props) => (props.navOpen ? 180 : 0)}deg);
  font-size: 12px;
  color: ${({ theme }) => theme.pulsar.color.text.normal};
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
  margin-left: auto;

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
