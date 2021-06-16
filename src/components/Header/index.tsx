import Image from 'next/image';

import { ConnectWallet } from '../../components/ConnectWallet';

import { header, logo, connect } from './styles';

type Props = { className?: string };

export const Header = ({ className }: Props) => {
  return (
    <header css={header} className={className}>
      <div css={logo}>
        <Image src="/logo.svg" alt="Skypools" layout="fill" />
      </div>
      <ConnectWallet css={connect} />
    </header>
  );
};
