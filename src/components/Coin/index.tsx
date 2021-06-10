import { useEffect, useMemo, useState } from 'react';

import { coin } from './styles';

const UNKNOWN = '/swap/coins/unknown.svg';

export const Coin = ({ src: srcParam, className }: { src: string; className?: string }) => {
  const [src, setSrc] = useState<string>(UNKNOWN);

  useEffect(() => {
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

  const style = useMemo(() => {
    if (src) {
      return { backgroundImage: `url(${src})` };
    }

    return undefined;
  }, [src]);

  return <div css={coin} className={className} style={style} />;
};
