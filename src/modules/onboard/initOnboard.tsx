import Onboard from 'bnc-onboard';
import type { Subscriptions } from 'bnc-onboard/dist/src/interfaces'; // eslint-disable-line import/no-internal-modules

import { blocknativeApiKey, infuraApiKey } from '../env';

const appName = 'Swingby Bridge';
const appUrl = 'https://bridge.swingby.network';

const RPC_URLS = {
  1: `https://mainnet.infura.io/v3/${infuraApiKey}`,
  5: `https://goerli.infura.io/v3/${infuraApiKey}`,
  56: 'https://bsc-dataseed1.binance.org:443',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
} as const;

export const initOnboard = ({
  networkId = 1,
  subscriptions,
}: {
  networkId?: keyof typeof RPC_URLS;
  subscriptions: Subscriptions;
}) => {
  const rpcUrl = RPC_URLS[networkId];
  if (!rpcUrl) {
    throw new Error(`Could not find RPC URL for network ID: "${networkId}"`);
  }

  return Onboard({
    dappId: blocknativeApiKey,
    networkId,
    hideBranding: true,
    subscriptions,
    walletSelect: {
      wallets: [
        { walletName: 'metamask', preferred: true },
        { walletName: 'ledger', preferred: true },
        ...(infuraApiKey ? [{ walletName: 'walletConnect', preferred: true }] : []),
        { walletName: 'walletLink', preferred: true },
        { walletName: 'authereum' },
        { walletName: 'lattice' },
        { walletName: 'torus' },
        { walletName: 'opera' },
        { walletName: 'trezor' },
      ].map((it) => ({ ...it, rpcUrl, appUrl, appName, infuraKey: infuraApiKey })),
    },
    walletCheck: [
      { checkName: 'derivationPath' },
      { checkName: 'connect' },
      { checkName: 'accounts' },
      { checkName: 'network' },
      { checkName: 'balance', minimumBalance: '100000' },
    ],
  });
};
