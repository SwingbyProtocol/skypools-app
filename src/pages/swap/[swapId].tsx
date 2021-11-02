import { GetServerSideProps } from 'next';

import { SwapDocument, SwapQuery, SwapQueryVariables } from '../../generated/skypools-graphql';
import { apolloClient } from '../../modules/apollo';

type Props = { swapId: string };

export default function SwapPage({ swapId }: Props) {
  return <span>{swapId}</span>;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const swapId = ctx.query.swapId;
  if (!swapId || typeof swapId !== 'string') {
    return { notFound: true };
  }

  const swap = await (async () => {
    try {
      const result = await apolloClient.query<SwapQuery, SwapQueryVariables>({
        query: SwapDocument,
        variables: { id: swapId },
      });

      return result.data?.swap ?? null;
    } catch (err) {
      return null;
    }
  })();
  if (swap && typeof swap.id === 'string') {
    return { props: { swapId: swap.id } };
  }

  return { notFound: true };
};
