import React from 'react';

import { useWalletConnection } from '../../../modules/hooks/useWalletConnection';
import { Header as OldHeader } from '../../../components/Header';

import {
  ArrowIcon,
  BurgerButton,
  ConnectButton,
  Header,
  OldHeaderContainer,
  Tittle,
} from './styled';

type NavHandlerProps = {
  navOpen: boolean;
  setNavOpen: (navOpen: boolean) => void;
};

function LayoutHeader({ navOpen, setNavOpen }: NavHandlerProps) {
  const { address, onWalletConnect, onWalletDisconnect } = useWalletConnection();

  return (
    <Header>
      <BurgerButton onClick={() => setNavOpen(!navOpen)}>
        <ArrowIcon navOpen={navOpen} />
      </BurgerButton>
      <img src="/skypools-logo.svg" alt="Skypool Logo" />
      <OldHeaderContainer>
        <OldHeader />
      </OldHeaderContainer>
      <ConnectButton variant={'small'} onClick={onWalletConnect}>
        Connect
      </ConnectButton>
    </Header>
  );
}

export default LayoutHeader;
