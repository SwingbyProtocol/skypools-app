import styled from '@emotion/styled';

export const Main = styled.main`
  grid-area: content;
  flex-grow: 1;
`;

export const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  min-width: 100vw;
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
