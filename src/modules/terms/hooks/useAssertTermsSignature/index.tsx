import { SkybridgeTermsMessage } from '@swingby-protocol/sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';

import { LOCAL_STORAGE } from '../../../env';
import { logger } from '../../../logger';
import { useOnboard } from '../../../onboard';

const hasSignedTerms = async ({ address }: { address: string }): Promise<Boolean> => {
  const signedSignature = localStorage.getItem(LOCAL_STORAGE.Terms);
  if (!signedSignature) return false;

  const { message } = SkybridgeTermsMessage;
  const web3 = new Web3();
  const signedAddress = web3.eth.accounts.recover(message, signedSignature);
  if (!signedAddress) return false;

  const checkSumAddress = web3.utils.toChecksumAddress(address);
  const recoveredCheckSumAddress = web3.utils.toChecksumAddress(signedAddress);

  return checkSumAddress === recoveredCheckSumAddress;
};

export const useAssertTermsSignature = () => {
  const { wallet, address, onboard } = useOnboard();
  const [isSignedTerms, setIsSignedTerms] = useState<boolean>(false);

  const assertTermsSignature = useCallback(async () => {
    if (!wallet || !address) {
      throw new Error('No wallet connected');
    }

    const signed = await hasSignedTerms({ address });
    if (signed) {
      setIsSignedTerms(true);
      return;
    }

    const { message, seed } = SkybridgeTermsMessage;
    if (!message || !seed) {
      throw new Error('No Terms of Service message found');
    }

    const web3 = new Web3(wallet.provider);
    const signature = await web3.eth.personal.sign(message, address, seed);
    localStorage.setItem(LOCAL_STORAGE.Terms, signature);
  }, [address, wallet]);

  useEffect(() => {
    if (!address || !onboard) return;

    (async () => {
      try {
        await assertTermsSignature();
      } catch (error) {
        logger.error({ error }, 'Error sign on the terms');
        await onboard.walletReset();
      }
    })();
  }, [address, assertTermsSignature, onboard]);

  return useMemo(
    () => ({ assertTermsSignature, isSignedTerms }),
    [assertTermsSignature, isSignedTerms],
  );
};
