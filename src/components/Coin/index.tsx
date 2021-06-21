import NextImage from 'next/image';
import { useEffect, useState } from 'react';

import { coin } from './styles';

const UNKNOWN = '/swap/unknown-coin.svg';

export const Coin = ({
  src: srcParam,
  className,
}: {
  src: string | null | undefined;
  className?: string;
}) => {
  const [src, setSrc] = useState<string>(srcParam ?? UNKNOWN);

  useEffect(() => {
    if (!srcParam) {
      return;
    }

    let cancelled = false;

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setSrc(srcParam);
    };

    img.onerror = () => {
      if (cancelled) return;
      setSrc(UNKNOWN);
    };

    img.src = srcParam;

    return () => {
      cancelled = true;
    };
  }, [srcParam]);

  return (
    <div css={coin} className={className}>
      <NextImage src={src} layout="fill" />
    </div>
  );
};
