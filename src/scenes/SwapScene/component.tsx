import React, { useEffect } from 'react';

import { Layout } from '../../components/Layout';
import { SkybridgeWidget } from '../../components/SkybridgeWidget';
import {
  SwapDocument,
  usePriceHistoryLazyQuery,
  useSwapQuery,
} from '../../generated/skypools-graphql';
import { useSkybridgeSwap } from '../../modules/para-inch-react';

import { SkypoolsSwap } from './SkypoolsSwap';

export const SwapScene = ({ swapId }: { swapId: string }) => {
  const { data } = useSwapQuery({
    query: SwapDocument,
    variables: { id: swapId },
  });

  const swap = data?.swap;

  const isSwapFromBtc = swap?.srcToken.symbol === 'BTC';
  const skybridgeId = swap?.skybridgeSwapId ?? '';
  const { status } = useSkybridgeSwap(skybridgeId);
  const isSkybridgeWidget = status !== 'COMPLETED';

  const skypoolsSwap = swap && <SkypoolsSwap destToken={swap?.destToken.symbol} swapId={swapId} />;

  const fromBtc = isSkybridgeWidget
    ? swap && (
        <SkybridgeWidget
          src={`https://widget.skybridge.exchange/${
            swap?.network === 'ROPSTEN' ? 'test' : 'production'
          }/swap/${swap?.skybridgeSwapId}`}
        />
      )
    : skypoolsSwap;

  const widget = swap && isSwapFromBtc ? fromBtc : skypoolsSwap;

  const [getPriceHistory, { data: priceHistoryData }] = usePriceHistoryLazyQuery();

  useEffect(() => {
    const firstTokenId = swap?.srcToken.id;
    const secondTokenId = swap?.destToken.id;
    if (!firstTokenId || !secondTokenId) {
      return;
    }

    getPriceHistory({ variables: { firstTokenId, secondTokenId } });
  }, [swap, getPriceHistory]);

  return (
    <Layout
      priceHistory={priceHistoryData?.priceHistoric}
      widgetContent={widget}
      isSkybridgeWidget={isSwapFromBtc && isSkybridgeWidget}
    />
  );
};
