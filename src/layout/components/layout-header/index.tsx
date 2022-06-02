import React from 'react';

import { ArrowIcon, BurgerButton, ConnectButton, Header, Tittle } from './styled';

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
      <Tittle>Skypools</Tittle>
      <ConnectButton variant={'small'}>Connect</ConnectButton>
    </Header>
  );
}

export default LayoutHeader;
