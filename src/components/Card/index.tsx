import React from 'react';

import { card } from './styles';

type Props = { children: React.ReactNode; className?: string };

export const Card = ({ children, className }: Props) => {
  return (
    <div css={card} className={className}>
      {children}
    </div>
  );
};
