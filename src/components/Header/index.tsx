import Image from 'next/image';

import { size } from '../../modules/styles';

import { header } from './styles';

type Props = { className?: string };

export const Header = ({ className }: Props) => {
  return (
    <header css={header} className={className}>
      <Image src="/logo.svg" alt="Skypools" height={size.state} width={size.state * (146 / 44)} />
    </header>
  );
};
