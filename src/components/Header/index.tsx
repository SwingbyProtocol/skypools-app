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

  const depositLink = false ? '/deposit' : 'https://skybridge.info/pool?bridge=btc_skypool';
  const withdrawLink = false ? '/withdraw' : 'https://skybridge.info/pool?bridge=btc_skypool';

  return (
    <header css={header} className={className}>
      <a css={logo} href="/">
        <img src="/skypools-logo.svg" alt="Skypool Logo" />
      </a>
      <div css={links}>
        <Link href={swapUrl}>
          <a href={swapUrl} css={link}>
            <FormattedMessage id="link.swap" />
          </a>
        </Link>
        <Link href={depositLink}>
          <a href={depositLink} css={link}>
            <FormattedMessage id="link.deposit" />
          </a>
        </Link>
        <Link href={withdrawLink}>
          <a href={withdrawLink} css={link}>
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
