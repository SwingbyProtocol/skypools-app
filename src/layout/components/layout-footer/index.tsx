import React from 'react';

import { useConfig } from '../../config';
import { Icon, ExternalLink } from '../commons';

import {
  Footer,
  FooterBottom,
  FooterTop,
  FooterTopLeft,
  FooterTopRight,
  NavSection,
  SwingbyLogo,
  SocialLinks,
  SwingbyLogoLabel,
  Copyright,
} from './styled';

function LayoutFooter() {
  const { links } = useConfig();

  return (
    <Footer>
      <FooterTop>
        <FooterTopLeft>
          <SwingbyLogo href="https://swingby.network/">
            <Icon name="bond-square-token" />
            <SwingbyLogoLabel>Swingby</SwingbyLogoLabel>
          </SwingbyLogo>
          <SocialLinks>
            <ExternalLink href={links.twitter} variant="ghost-alt" iconOnly size="small">
              <Icon name="twitter" />
            </ExternalLink>
            <ExternalLink href={links.discord} variant="ghost-alt" iconOnly size="small">
              <Icon name="discord" />
            </ExternalLink>
            <ExternalLink href={links.github} variant="ghost-alt" iconOnly size="small">
              <Icon name="github" />
            </ExternalLink>
          </SocialLinks>
        </FooterTopLeft>
        <FooterTopRight>
          <NavSection>
            <ul>
              <li>
                <a href={links.website}>Website</a>
              </li>
              <li>
                <a href={links.blog}>Blog</a>
              </li>
            </ul>
          </NavSection>
          <NavSection>
            <ul>
              <li>
                <ExternalLink variant="text-alt" href={links.skybridgeInfo}>
                  skybridge.info
                </ExternalLink>
              </li>
              <li>
                <ExternalLink variant="text-alt" href={links.swingbyBridge}>
                  ERC20 - BEP20 Token bridge
                </ExternalLink>
              </li>
            </ul>
          </NavSection>
        </FooterTopRight>
      </FooterTop>
      <FooterBottom>
        <Copyright>Swingby DAO © 2022</Copyright>
      </FooterBottom>
    </Footer>
  );
}

export default LayoutFooter;
