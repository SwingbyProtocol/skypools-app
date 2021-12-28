import Image from 'next/image';
import { useMedia } from 'react-use';
import Link from 'next/link';
import { FormattedMessage } from 'react-intl';

import { ConnectWallet } from '../../components/ConnectWallet';
import { useOnboard } from '../../modules/onboard';
import { Floats } from '../Floats';

import { header, logo, connect, info, links, link } from './styles';

type Props = { className?: string };

export const Header = ({ className }: Props) => {
  const isDarkMode = useMedia('(prefers-color-scheme: dark)', false);
  const { network } = useOnboard();

  const swapUrl = `/swap/${
    network ? network.toLowerCase() : 'ethereum'
  }/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/0x0b7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7c`;

  return (
    <header css={header} className={className}>
      <a css={logo} href="/">
        <Image src={`/logo-${isDarkMode ? 'dark' : 'light'}.svg`} alt="Skypools" layout="fill" />
      </a>
      <div css={links}>
        <Link href={swapUrl}>
          <a href={swapUrl} css={link}>
            <FormattedMessage id="link.swap" />
          </a>
        </Link>
        <Link href={'/deposit'}>
          <a href="/deposit" css={link}>
            <FormattedMessage id="link.deposit" />
          </a>
        </Link>
        <Link href={'/withdraw'}>
          <a href="/withdraw" css={link}>
            <FormattedMessage id="link.withdraw" />
          </a>
        </Link>
      </div>
      <div css={info}>
        <Floats />
        <ConnectWallet css={connect} />
      </div>
    </header>
  );
};
