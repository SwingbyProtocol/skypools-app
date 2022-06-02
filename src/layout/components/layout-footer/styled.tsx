import styled from 'styled-components';

export const Footer = styled.footer`
  background: ${({ theme }) => theme.pulsar.color.bg.normal};
  grid-area: footer;
  padding: 16px 64px 0;
  margin: auto 0 0;
`;

export const FooterTop = styled.div`
  border-top: 1px solid ${({ theme }) => theme.pulsar.color.border.normal};
  padding: 64px 0;
  display: flex;
  justify-content: space-between;
`;

export const FooterTopLeft = styled.div`
  max-width: 200px;
`;

export const FooterTopRight = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px 80px;
`;

export const NavSection = styled.section`
  ul {
    list-style-type: none;
    display: grid;
    gap: 16px;
  }

  a {
    font-weight: 600;
  }
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 24px;
  @media (max-width: 830px) {
    flex-direction: column;
  }
`;

export const SwingbyLogo = styled.a`
  text-decoration: none;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;
export const SwingbyLogoLabel = styled.text`
  font-weight: bold;
  color: ${({ theme }) => theme.pulsar.color.text.normal};
  margin-left: 12px;
`;

export const FooterBottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.pulsar.color.border.normal};
  padding: 24px 0;
  display: grid;
  gap: 40px 16px;
  grid-template-columns: max-content 1fr;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Copyright = styled.text`
  font-weight: 500;
  color: ${({ theme }) => theme.pulsar.color.text.placeholder};
`;
