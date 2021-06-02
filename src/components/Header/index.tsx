import { cx } from '@linaria/core';

import { header, logo } from './styles';

type Props = { className?: string };

export const Header = ({ className }: Props) => {
  return (
    <header className={cx(header, className)}>
      <img className={logo} src="/logo.svg" alt="Skypools" />
    </header>
  );
};
