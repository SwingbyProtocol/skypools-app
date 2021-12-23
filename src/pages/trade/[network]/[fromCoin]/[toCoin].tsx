import { GetServerSideProps } from 'next';
import { useMemo } from 'react';

import { Network } from '../../../../modules/networks';
import { ParaInchTokenProvider } from '../../../../modules/para-inch-react';
import { logger } from '../../../../modules/logger';
import { apolloClient } from '../../../../modules/apollo';
import {
  TokensDocument,
  TokensQuery,
  TokensQueryVariables,
} from '../../../../generated/skypools-graphql';
import { isFakeBtcToken, isFakeNativeToken } from '../../../../modules/para-inch';
import { TradeScene } from '../../../../scenes/TradeScene';

type Props = React.ComponentPropsWithoutRef<typeof ParaInchTokenProvider>['value'];

export default function TradePage({ fromToken, toToken, tokens, network }: Props) {
  const value = useMemo(
    () => ({ fromToken, toToken, tokens, network }),
    [fromToken, toToken, tokens, network],
  );

  return (
    <ParaInchTokenProvider value={value}>
      <TradeScene />
    </ParaInchTokenProvider>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const fromCoinAddress = ctx.query.fromCoin;
  const toCoinAddress = ctx.query.toCoin;

  const network = ((): Network | null => {
    const value = typeof ctx.query.network === 'string' ? ctx.query.network : null;
    if (!value) return null;

    return Network[value.toUpperCase() as Network] ?? null;
  })();

  if (!network) {
    return {
      redirect: {
        destination: `/quote/ethereum/${fromCoinAddress}/${toCoinAddress}`,
        permanent: false,
      },
    };
  }

  const tokens = await (async () => {
    try {
      return (
        await apolloClient.query<TokensQuery, TokensQueryVariables>({
          query: TokensDocument,
          variables: { where: { network: { equals: network } } },
        })
      ).data.tokens.edges
        .map((it) => it.node)
        .filter((it) => it.symbol !== 'WBTC');
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
      tokens.find(({ address }) => isFakeBtcToken(address))?.address ||
      tokens[0]?.address;

    const newTo =
      toCoin?.address || tokens.filter(({ address }) => isFakeNativeToken(address))?.[0]?.address;

    if (newFrom && newTo) {
      return {
        redirect: {
          destination: `/quote/${network.toLowerCase()}/${newFrom}/${newTo}`,
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
