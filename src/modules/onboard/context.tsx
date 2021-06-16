import React, { useContext } from 'react';

import { OnboardGlobalStyles } from './OnboardGlobalStyles';
import { useOnboardInstance } from './useOnboardInstance';

const InternalContext = React.createContext<ReturnType<typeof useOnboardInstance>>(null as any);

export const OnboardProvider = ({ children }: { children: React.ReactNode }) => {
  const instance = useOnboardInstance();
  return (
    <InternalContext.Provider value={instance}>
      <OnboardGlobalStyles />
      {children}
    </InternalContext.Provider>
  );
};

export const useOnboard = () => useContext(InternalContext);
