import styled from 'styled-components';

export const Main = styled.main`
  grid-area: content;
  flex-grow: 1;
`;

export const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.pulsar.color.bg.normal};

  @media (max-width: 768px) {
    display: block;
  }
`;

export const Body = styled.div`
  flex-direction: column;
  display: flex;
  flex: 1;
`;
