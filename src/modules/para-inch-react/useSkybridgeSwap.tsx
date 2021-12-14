import { useEffect, useMemo, useState, useCallback } from 'react';

import { useSkybridgeSwapInfoLazyQuery } from '../../generated/skybridge-graphql';

export const useSkybridgeSwap = (skybridgeId: string) => {
  const [wbtcSrcAmount, setWbtcSrcAmount] = useState<string>('0');
  const [status, setStatus] = useState<string>('WAITING');
  const [getSwaps, result] = useSkybridgeSwapInfoLazyQuery({
    pollInterval: 5000,
    onCompleted: () => console.log('check'),
  });

  const getSwap = useCallback(() => {
    if (!skybridgeId) return;

    getSwaps({
      variables: {
        id: skybridgeId,
      },
    });
  }, [getSwaps, skybridgeId]);

  useEffect(() => {
    getSwap();
    // const interval = setInterval(() => {
    //   getSwap();
    // }, 120000);

    // return () => clearInterval(interval);
  }, [getSwap]);

  useEffect(() => {
    if (!result.data) return;

    console.log('result.data.transaction.status', result.data.transaction.status);
    setStatus(result.data.transaction.status);
    setWbtcSrcAmount(result.data.transaction.receivingAmount);
  }, [result]);

  return useMemo(() => {
    return {
      wbtcSrcAmount,
      status,
    };
  }, [wbtcSrcAmount, status]);
};
