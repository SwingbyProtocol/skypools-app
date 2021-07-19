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
  const { network, setFromToken, fromToken, setAmount } = useParaInch();
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
    if (!data) return;

    const fromCurrency = data.transaction.receivingCurrency;

    if (network === 1 && fromCurrency === TransactionCurrency.WbtcErc20) {
      if (fromToken?.address.toLowerCase() !== ETH_WBTC) {
        setFromToken(ETH_WBTC);
      }

      setAmount(data.transaction.receivingAmount);
    }

    if (network === 56 && fromCurrency === TransactionCurrency.BtcbBep20) {
      if (fromToken?.address.toLowerCase() !== BSC_BTCB) {
        setFromToken(BSC_BTCB);
      }

      setAmount(data.transaction.receivingAmount);
    }
  }, [data, network, setFromToken, fromToken, setAmount]);

  return {
    data,
    loading,
    swapId,
    fromDisabled: (() => {
      return (
        (network === 1 && data?.transaction.receivingCurrency === TransactionCurrency.WbtcErc20) ||
        (network === 56 && data?.transaction.receivingCurrency === TransactionCurrency.BtcbBep20)
      );
    })(),
  };
};
