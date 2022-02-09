import { FormattedMessage } from 'react-intl';
import { useEffect } from 'react';

import { shortenAddress } from '../../modules/short-address';
import { logger } from '../../modules/logger';
import { Button } from '../Button';
import { NetworkTag } from '../NetworkTag';
import { useOnboard } from '../../modules/onboard';
import { IGNORED_STORE_WALLET_NAMES, LOCAL_STORAGE } from '../../modules/env';

import { container, networkTag, walletWrapper } from './styled';

export const ConnectWallet = ({ className }: { className?: string }) => {
  const { address, network, onboard, wallet } = useOnboard();
  const localStorage = typeof window !== 'undefined' && window.localStorage;
  const storedWallet = localStorage && localStorage.getItem(LOCAL_STORAGE.Wallet);

  useEffect(() => {
    if (
      !localStorage ||
      !wallet ||
      !wallet.name ||
      IGNORED_STORE_WALLET_NAMES.find((name) => name === wallet.name)
    ) {
      return;
    }
    localStorage.setItem(LOCAL_STORAGE.Wallet, wallet.name);
  }, [wallet, localStorage]);

  useEffect(() => {
    if (!onboard || !storedWallet) return;
    (async () => {
      await onboard.walletSelect(storedWallet);
    })();
  }, [onboard, storedWallet]);

  return (
    <div css={container} className={className}>
      <div css={walletWrapper}>
        {!!address && <NetworkTag css={networkTag} network={network} />}
        <Button
          variant="secondary"
          size="street"
          shape="fit"
          onClick={() => {
            try {
              if (address) {
                onboard?.walletReset();
                localStorage && localStorage.setItem(LOCAL_STORAGE.Wallet, '');
                return;
              }

              onboard?.walletSelect();
            } catch (err) {
              logger.error({ err });
            }
          }}
          title={address ?? undefined}
        >
          {address ? shortenAddress({ value: address }) : <FormattedMessage id="wallet.connect" />}
        </Button>
      </div>
    </div>
  );
};
