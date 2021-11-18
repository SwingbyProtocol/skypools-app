import { Layout } from '../../components/Layout';
import { SwapDocument, SwapStatus, useSwapQuery } from '../../generated/skypools-graphql';
import { useSkybridgeSwap } from '../../modules/skypools';

import { SkybridgeWidget } from './SkybridgeWidget';
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

  const fromBtc =
    status === 'COMPLETED'
      ? swap && (
          <SkypoolsSwap
            destToken={swap.destToken.symbol}
            srcToken={swap.srcToken.symbol}
            swapId={swapId}
          />
        )
      : swap && (
          <SkybridgeWidget
            src={`https://widget.skybridge.exchange/${
              swap?.network === 'ROPSTEN' ? 'test' : 'production'
            }/swap/${swap?.skybridgeSwapId}`}
          />
        );

  const widget = swap && isSwapFromBtc ? fromBtc : <div>ERC20 token to BTC</div>;

  return (
    <Layout
      priceHistory={null}
      widgetContent={widget}
      isSkybridgeWidget={isSwapFromBtc && status === SwapStatus.Pending}
    />
  );
};
