import React, { useState } from 'react';

import LayoutFooter from './components/layout-footer';
import LayoutHeader from './components/layout-header';
import LayoutSideNav from './components/layout-side-nav';
import { Body, LayoutContainer, Main } from './styled';

function LayoutView({ children, ...props }: { children: React.ReactNode; enableFooter?: boolean }) {
  const [navOpen, setNavOpen] = useState(true);

  return (
    <LayoutContainer>
      <LayoutSideNav navOpen={navOpen} setNavOpen={setNavOpen} />
      <Body>
        <LayoutHeader navOpen={navOpen} setNavOpen={setNavOpen} />

        <Main>{children}</Main>
        {props.enableFooter && <LayoutFooter />}
      </Body>
    </LayoutContainer>
  );
}

export default LayoutView;
