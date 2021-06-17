import { SwapScene } from '../../../scenes/SwapScene';

type Props = { fromCoin: string | null; toCoin: string | null };

export default function HomePage({ fromCoin, toCoin }: Props) {
  return <SwapScene />;
}
