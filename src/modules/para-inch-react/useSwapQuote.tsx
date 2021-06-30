import { BigSource } from 'big.js';
import { useEffect, useState } from 'react';

import { logger } from '../logger';
import { SupportedNetworkId, getSwapQuote, SwapQuote, ParaInchToken } from '../para-inch';

export const useSwapQuote = ({
  network,
  amount,
  fromToken,
  toToken,
}: {
  fromToken: ParaInchToken | null;
  toToken: ParaInchToken | null;
  amount: BigSource | null;
  network: SupportedNetworkId;
}) => {
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!fromToken || !toToken) {
      return;
    }

    const loadQuote = async () => {
      try {
        if (cancelled) return;

        setSwapQuote(null);
        const result = await getSwapQuote({ fromToken, toToken, amount: amount ?? 1, network });

        if (cancelled) return;
        setSwapQuote(result);
      } catch (err) {
        logger.error({ err }, 'Failed to load swap quote');
        setTimeout(loadQuote, 2500);
      }
    };

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [fromToken, toToken, network, amount]);

  return { swapQuote };
};
