import { useRouter } from 'next/router';
import { useEffect } from 'react';

import {
  TransactionCurrency,
  TransactionStatus,
  useSkybridgeSwapInfoLazyQuery,
} from '../../../../generated/graphql';
import { useParaInch } from '../../../../modules/para-inch-react';

const ETH_WBTC = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
const BSC_BTCB = '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c';

export const useSkybridgeSwap = () => {
  const { network, setFromToken, fromToken } = useParaInch();
  const { query } = useRouter();
  const swapId = (() => {
    const value = query.skybridgeSwap;
    if (typeof value !== 'string' || !value) {
      return null;
    }

    return value;
  })();

  const [getSwapInfo, { data, loading, stopPolling, startPolling }] =
    useSkybridgeSwapInfoLazyQuery();

  useEffect(() => {
    if (!swapId) return;
    getSwapInfo({ variables: { id: swapId } });
  }, [getSwapInfo, swapId]);

  useEffect(() => {
    if (data?.transaction.status !== TransactionStatus.Completed) {
      startPolling?.(15000);
    }

    return () => {
      stopPolling?.();
    };
  }, [data, stopPolling, startPolling]);

  useEffect(() => {
    const fromCurrency = data?.transaction.receivingCurrency;
    if (!fromCurrency) return;

    if (
      network === 1 &&
      fromCurrency === TransactionCurrency.WbtcErc20 &&
      fromToken?.address.toLowerCase() !== ETH_WBTC
    ) {
      setFromToken(ETH_WBTC);
    }

    if (
      network === 56 &&
      fromCurrency === TransactionCurrency.BtcbBep20 &&
      fromToken?.address.toLowerCase() !== BSC_BTCB
    ) {
      setFromToken(BSC_BTCB);
    }
  }, [data, network, setFromToken, fromToken]);

  return {
    data,
    loading,
    swapId,
    fromDisabled: (() => {
      return (
        network === 1 &&
        data?.transaction.receivingCurrency.toLowerCase() === TransactionCurrency.WbtcErc20
      );
    })(),
  };
};
