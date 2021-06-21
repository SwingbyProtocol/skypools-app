import { GetServerSideProps } from 'next';
import { useMemo } from 'react';

import { isSupportedNetworkId, getTokens, isNativeToken } from '../../../../modules/para-inch';
import { ParaInchTokenProvider, ParaInchContextValue } from '../../../../modules/para-inch-react';
import { logger } from '../../../../modules/logger';
import { SwapScene } from '../../../../scenes/SwapScene';

type Props = ParaInchContextValue & {
  network: number;
};

export default function HomePage({ fromToken, toToken, tokens, network }: Props) {
  const value = useMemo(
    () => ({ fromToken, toToken, tokens, network }),
    [fromToken, toToken, tokens, network],
  );

  return (
    <ParaInchTokenProvider value={value}>
      <SwapScene />
    </ParaInchTokenProvider>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const fromCoinAddress = ctx.query.fromCoin;
  const toCoinAddress = ctx.query.toCoin;

  const network = (() => {
    const asNumber = typeof ctx.query.network === 'string' && +ctx.query.network;
    return isSupportedNetworkId(asNumber) ? asNumber : null;
  })();

  if (!network) {
    return {
      redirect: { destination: `/swap/1/${fromCoinAddress}/${toCoinAddress}`, permanent: false },
    };
  }

  const tokens = await (async () => {
    try {
      return await getTokens({ network });
    } catch (err) {
      logger.fatal({ err }, 'Could not load token list');
      return [];
    }
  })();

  const fromCoin =
    tokens.find(
      ({ address }) =>
        typeof fromCoinAddress === 'string' &&
        address.toLowerCase() === fromCoinAddress.toLowerCase(),
    ) ?? null;

  const toCoin =
    tokens.find(
      ({ address }) =>
        typeof toCoinAddress === 'string' && address.toLowerCase() === toCoinAddress.toLowerCase(),
    ) ?? null;

  if (!fromCoin || !toCoin) {
    const newFrom =
      fromCoin?.address ||
      tokens.find(({ address }) => isNativeToken(address))?.address ||
      tokens[0]?.address;

    const newTo =
      toCoin?.address || tokens.filter(({ address }) => !isNativeToken(address))?.[0]?.address;

    if (newFrom && newTo) {
      return {
        redirect: {
          destination: `/swap/${network}/${newFrom}/${newTo}`,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      fromToken: fromCoin,
      toToken: toCoin,
      tokens,
      network,
    },
  };
};
