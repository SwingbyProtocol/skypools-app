import React from 'react';

import { Header as OldHeader } from '../../../components/Header';
import { ConnectWallet } from '../commons';

import { ArrowIcon, BurgerButton, Header, OldHeaderContainer } from './styled';

type NavHandlerProps = {
  navOpen: boolean;
  setNavOpen: (navOpen: boolean) => void;
};

function LayoutHeader({ navOpen, setNavOpen }: NavHandlerProps) {
  return (
    <Header>
      <BurgerButton onClick={() => setNavOpen(!navOpen)}>
        <ArrowIcon navOpen={navOpen} />
      </BurgerButton>
      <img src="/skypools-logo.svg" alt="Skypool Logo" />
      <OldHeaderContainer>
        <OldHeader />
      </OldHeaderContainer>
      <ConnectWallet />
    </Header>
  );
}

export default LayoutHeader;
