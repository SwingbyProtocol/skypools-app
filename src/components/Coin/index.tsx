import NextImage from 'next/image';

import { coin } from './styles';

const UNKNOWN = '/swap/coins/unknown.svg';

export const Coin = ({
  src: srcParam,
  className,
}: {
  src: string | null | undefined;
  className?: string;
}) => {
  return (
    <div css={coin} className={className}>
      <NextImage src={srcParam || UNKNOWN} layout="fill" />
    </div>
  );
};
