import Onboard from 'bnc-onboard';
import type { Subscriptions } from 'bnc-onboard/dist/src/interfaces'; // eslint-disable-line import/no-internal-modules

import { blocknativeApiKey, infuraApiKey } from '../env';
import { getRpcServiceUrl } from '../networks';

const appName = 'Swingby Bridge';
const appUrl = 'https://bridge.swingby.network';

export const initOnboard = ({
  networkId = 1,
  subscriptions,
}: {
  networkId?: number;
  subscriptions: Subscriptions;
}) => {
  const rpcUrl = getRpcServiceUrl(networkId);
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
        { walletName: 'ledger', preferred: false },
        ...(infuraApiKey ? [{ walletName: 'walletConnect', preferred: false }] : []),
        { walletName: 'walletLink', preferred: false },
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
