import { FormattedMessage } from 'react-intl';

import { useSkypoolsFloats } from '../../modules/para-inch-react';

import { FloatsItem } from './FloatsItem';
import { floatsRow, floatsTitle, floatsContainer } from './styles';

export const Floats = () => {
  const btcImage = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579';
  const wbtcImage =
    'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744';

  const { floats } = useSkypoolsFloats();

  return (
    floats && (
      <div css={floatsContainer}>
        <div css={floatsTitle}>
          <FormattedMessage id="floats" />
        </div>
        <div css={floatsRow}>
          <FloatsItem image={btcImage} amount={floats.btc} />
          <FloatsItem image={wbtcImage} amount={floats.wrappedBtc} />
        </div>
      </div>
    )
  );
};
