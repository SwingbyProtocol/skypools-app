import Image from 'next/image';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import { useSkypoolsFloats } from '../../modules/para-inch-react';

import { floatsColumn, floatsRow, floatsTitle, floatsContainer } from './styles';

export const Floats = () => {
  const btcImage = 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579';
  const wbtcImage =
    'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png?1548822744';

  const { floats } = useSkypoolsFloats();

  const floatItem = (image: string, amount: string) => (
    <div css={floatsColumn}>
      <Image src={image} alt="btc" layout="fixed" width={26} height={26} />
      <FormattedNumber value={Number(amount)} maximumFractionDigits={3} />
    </div>
  );

  return (
    floats && (
      <div css={floatsContainer}>
        <div css={floatsTitle}>
          <FormattedMessage id="floats" />
        </div>
        <div css={floatsRow}>
          {floatItem(btcImage, floats.btc)}
          {floatItem(wbtcImage, floats.wrappedBtc)}
        </div>
      </div>
    )
  );
};