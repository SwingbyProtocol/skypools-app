import { Coin } from '../Coin';

// These should be exactly the same as the icon file names in `/public`.
const ICONS = [
  'aave',
  'balancer',
  'bancor',
  'chai',
  'cofix',
  'compound',
  'creamswap',
  'curve',
  'dodo',
  'kyber',
  'miniswap',
  'mooniswap',
  'mstable',
  'oasis',
  'oneinch',
  'pancakeswap',
  'paraswap',
  'shibaswap',
  'skybridge',
  'sushiswap',
  'synthetix',
  'uniswap',
  'valueliquid',
  'weth',
  'zrx',
];

export const PlatformLogo = ({ className, name }: { className?: string; name: string }) => {
  const logo = (() => {
    return (
      ICONS.find((iconName) =>
        name.toLowerCase().replace(/[_\s]/gi, '').includes(iconName.replace('swap', '')),
      ) ?? name
    );
  })();

  return <Coin css={className} src={`/swap/platforms/${logo}.svg`} />;
};
