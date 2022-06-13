import styled from '@emotion/styled';
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
      border-width: 0;
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

export const OldHeaderContainer = styled.div`
  display: flex;
  margin: auto;
`;
