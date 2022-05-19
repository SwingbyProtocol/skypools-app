import NextImage from 'next/image';
import { ComponentPropsWithoutRef, useState } from 'react';

import { coin } from './styles';

const UNKNOWN = '/swap/unknown-coin.svg';

export const Coin = ({
  src,
  className,
  loading,
}: {
  src: string | null | undefined;
  className?: string;
  loading?: ComponentPropsWithoutRef<typeof NextImage>['loading'];
}) => {
  const [imgSrc, setImgSrc] = useState(src || UNKNOWN);

  return (
    <div css={coin} className={className}>
      <NextImage
        src={imgSrc}
        blurDataURL={UNKNOWN}
        onError={() => {
          setImgSrc(UNKNOWN);
        }}
        loading={loading}
        width={24}
        height={24}
      />
    </div>
  );
};
