import { GetServerSideProps } from 'next';
import { useMemo } from 'react';

import { CurrentCoinsProvider, SwapScene } from '../../../scenes/SwapScene';

type Props = { fromCoin: string | null; toCoin: string | null };

export default function HomePage({ fromCoin, toCoin }: Props) {
  const value = useMemo(() => ({ fromCoin, toCoin }), [fromCoin, toCoin]);
  return (
    <CurrentCoinsProvider value={value}>
      <SwapScene />
    </CurrentCoinsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { fromCoin: fromCoinParam, toCoin: toCoinParam } = context.query;

  const fromCoin = (typeof fromCoinParam === 'string' ? fromCoinParam : null) || null;
  const toCoin = (typeof toCoinParam === 'string' ? toCoinParam : null) || null;

  return { props: { fromCoin, toCoin } };
};
