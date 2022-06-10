import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';

import { Icon } from '../commons';
import { useConfig } from '../../config';

import {
  Aside,
  BottomItemContainer,
  BottomContainer,
  ButtonContent,
  ButtonLabel,
  CloseButton,
  LogoContainer,
  LogoLabel,
  LogoLink,
  Mask,
  Nav,
  NavLink,
  Wrapper,
  SwapLabel,
  ButtonHint,
  Dot,
} from './styled';

type NavHandlerProps = {
  navOpen: boolean;
  setNavOpen: (navOpen: boolean) => void;
};

function LayoutSideNav({ navOpen, setNavOpen }: NavHandlerProps) {
  const { push, asPath, locales = [] } = useRouter();
  const { sideNavItems } = useConfig();
  const { locale } = useIntl();

  const changeLocale = useCallback(
    (locale: string) => push(asPath, undefined, { locale }),
    [push, asPath],
  );

  return (
    <Wrapper>
      <Mask navOpen={navOpen} onClick={() => setNavOpen(false)} />

      <Aside open={navOpen}>
        <LogoContainer>
          <CloseButton onClick={() => setNavOpen(false)}>
            <Icon name="close" />
          </CloseButton>
          <LogoLink href="https://swingby.network/">
            <Icon name="bond-square-token" />
            <LogoLabel navOpen={navOpen}>Swingby</LogoLabel>
          </LogoLink>
        </LogoContainer>
        <Nav>
          <NavLink href="https://skypools.swingby.network/">
            <SwapLabel>Swap</SwapLabel>
          </NavLink>
          {sideNavItems.map(({ href, render, key, hint }) => {
            const isCurrentRoute = render === 'Skypools';
            return (
              <NavLink href={href} key={key} currentRoute={isCurrentRoute}>
                <Dot currentRoute={isCurrentRoute} />
                <ButtonContent navOpen={navOpen}>
                  <ButtonLabel>{render}</ButtonLabel>
                  {hint && <ButtonHint>{hint}</ButtonHint>}
                </ButtonContent>
              </NavLink>
            );
          })}
        </Nav>

        <BottomContainer>
          <BottomItemContainer>
            {/*<LocaleSwitcher locale={locale} locales={locales} onChange={changeLocale} />*/}
          </BottomItemContainer>
        </BottomContainer>
      </Aside>
    </Wrapper>
  );
}

export default LayoutSideNav;
