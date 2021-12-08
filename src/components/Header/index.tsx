import Image from 'next/image';
import { useMedia } from 'react-use';

import { ConnectWallet } from '../../components/ConnectWallet';
import { useOnboard } from '../../modules/onboard';
import { Floats } from '../Floats';

import { header, logo, connect, info } from './styles';

type Props = { className?: string };

export const Header = ({ className }: Props) => {
  const isDarkMode = useMedia('(prefers-color-scheme: dark)', false);
  const { wallet } = useOnboard();

  return (
    <header css={header} className={className}>
      <a css={logo} href="/">
        <Image src={`/logo-${isDarkMode ? 'dark' : 'light'}.svg`} alt="Skypools" layout="fill" />
      </a>
      <div css={info}>
        {wallet && <Floats />}
        <ConnectWallet css={connect} />
      </div>
    </header>
  );
};
