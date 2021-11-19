import { useEffect, useMemo, useState } from 'react';

import { useSkybridgeSwapInfoLazyQuery } from '../../generated/skybridge-graphql';

export const useSkybridgeSwap = (skybridgeId: string) => {
  const [wbtcSrcAmount, setwbtcSrcAmount] = useState<string>('0');
  const [status, setStatus] = useState<string>('WAITING');

  const [getSwaps, result] = useSkybridgeSwapInfoLazyQuery();

  useEffect(() => {
    if (!skybridgeId) return;

    getSwaps({
      variables: {
        id: skybridgeId,
      },
    });
  }, [getSwaps, skybridgeId]);

  useEffect(() => {
    if (!result.data) return;
    console.log('result', result.data);

    setStatus(result.data.transaction.status);
    setwbtcSrcAmount(result.data.transaction.receivingAmount);
  }, [result]);

  return useMemo(() => {
    return {
      wbtcSrcAmount,
      status,
    };
  }, [wbtcSrcAmount, status]);
};
