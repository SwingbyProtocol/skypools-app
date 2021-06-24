import Image from 'next/image';
import { useMedia } from 'react-use';

import { ConnectWallet } from '../../components/ConnectWallet';

import { header, logo, connect } from './styles';

type Props = { className?: string };

export const Header = ({ className }: Props) => {
  const isDarkMode = useMedia('(prefers-color-scheme: dark)', false);
  return (
    <header css={header} className={className}>
      <div css={logo}>
        <Image src={`/logo-${isDarkMode ? 'dark' : 'light'}.svg`} alt="Skypools" layout="fill" />
      </div>
      <ConnectWallet css={connect} />
    </header>
  );
};
