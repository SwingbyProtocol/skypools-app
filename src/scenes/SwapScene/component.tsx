import { Layout } from '../../components/Layout';
import { SwapDocument, useSwapQuery } from '../../generated/skypools-graphql';
import { useSkybridgeSwap } from '../../modules/skypools';

import { SkybridgeWidget } from './SkybridgeWidget';
import { SkypoolsSwap } from './SkypoolsSwap';

export const SwapScene = ({ swapId }: { swapId: string }) => {
  const { data } = useSwapQuery({
    query: SwapDocument,
    variables: { id: swapId },
  });

  const swap = data?.swap;
  console.log('swap', swap);

  const isSwapFromBtc = swap?.srcToken.symbol === 'BTC';
  const skybridgeId = swap?.skybridgeSwapId ?? '';
  const { status } = useSkybridgeSwap(skybridgeId);
  const isSkybridgeWidget = status !== 'COMPLETED';

  const fromBtc = isSkybridgeWidget
    ? swap && (
        <SkybridgeWidget
          src={`https://widget.skybridge.exchange/${
            swap?.network === 'ROPSTEN' ? 'test' : 'production'
          }/swap/${swap?.skybridgeSwapId}`}
        />
      )
    : swap && (
        <SkypoolsSwap
          destToken={swap.destToken.symbol}
          srcToken={swap.srcToken.symbol}
          swapId={swapId}
        />
      );

  const widget = swap && isSwapFromBtc ? fromBtc : <div>ERC20 token to BTC</div>;

  return (
    <Layout
      priceHistory={null}
      widgetContent={widget}
      isSkybridgeWidget={isSwapFromBtc && isSkybridgeWidget}
    />
  );
};
