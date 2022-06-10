import Image from 'next/image';
import { FormattedNumber } from 'react-intl';

import { floatsColumn } from './styles';

export const FloatsItem = ({ image, amount }: { image: string; amount: string }) => (
  <div css={floatsColumn}>
    <Image src={image} alt="btc" layout="fixed" width={22} height={22} />
    <FormattedNumber value={Number(amount)} maximumFractionDigits={3} />
  </div>
);
