import Link from 'next/link';
import { FormattedMessage } from 'react-intl';

import { ConnectWallet } from '../../components/ConnectWallet';
import { useOnboard } from '../../modules/onboard';
import { Floats } from '../Floats';

import { connect, header, info, link, links, logo } from './styles';

type Props = { className?: string };

export const Header = ({ className }: Props) => {
  const { network } = useOnboard();

  const swapUrl = `/swap/${
    network ? network.toLowerCase() : 'ethereum'
  }/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/0x0b7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7c`;

  return (
    <header css={header} className={className}>
      <a css={logo} href="/">
        <FormattedMessage id="logo" />
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
