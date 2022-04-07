import { useEffect, useCallback, useState } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import ABI from 'human-standard-token-abi';
import { Big } from 'big.js';

import { Network } from '../networks';
import { useOnboard } from '../onboard';
import { getWrappedBtcAddress, isFakeBtcToken, isFakeNativeToken } from '../para-inch';
import { logger } from '../logger';

const MAX_ALLOWANCE = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

export const useParaInchSwapApproval = ({
  token: tokenParam,
  spender,
  network,
}: {
  token: string | null | undefined;
  spender: string | null | undefined;
  network: Network | null | undefined;
}) => {
  const { address, wallet } = useOnboard();
  const [isApprovalNeeded, setApprovalNeeded] = useState<boolean | null>(null);

  const token =
    network && tokenParam && isFakeBtcToken(tokenParam)
      ? getWrappedBtcAddress(network)
      : tokenParam;

  useEffect(() => {
    let cancelled = false;

    const check = async (): Promise<boolean | null> => {
      if (!token || !spender || !address || !wallet || !wallet.provider || !network) {
        return null;
      }

      if (isFakeNativeToken(token)) {
        return false;
      }

      try {
        const web3 = new Web3(wallet.provider);
        const contract = new web3.eth.Contract(ABI, token);

        const allowance = new Big(await contract.methods.allowance(address, spender).call());
        const maxAllowance = new Big(MAX_ALLOWANCE.toString(10));

        return allowance.lt(maxAllowance);
      } catch (err) {
        logger.error({ err }, 'Failed to check allowance');
        return null;
      }
    };

    const checkPeriodically = async () => {
      if (cancelled) return;
      const result = await check();
      if (cancelled) return;
      setApprovalNeeded(result);
      setTimeout(checkPeriodically, 15000);
    };

    checkPeriodically();

    return () => {
      cancelled = true;
    };
  }, [address, wallet, spender, token, network]);

  const approve = useCallback(async () => {
    if (!isApprovalNeeded) {
      throw new Error('Approval is not needed');
    }

    if (!address || !wallet || !wallet.provider) {
      throw new Error('No wallet connected');
    }

    if (!spender) {
      throw new Error('No spender to approve');
    }

    if (!token) {
      throw new Error('No token to approve');
    }

    const web3 = new Web3(wallet.provider);
    const contract = new web3.eth.Contract(ABI, token);

    const gasPrice = await web3.eth.getGasPrice();
    const rawTx: TransactionConfig = {
      nonce: await web3.eth.getTransactionCount(address),
      gasPrice: web3.utils.toHex(gasPrice),
      from: address,
      to: token,
      value: '0x0',
      data: contract.methods.approve(spender, MAX_ALLOWANCE).encodeABI(),
    };

    const estimatedGas = await web3.eth.estimateGas(rawTx);
    return await web3.eth.sendTransaction({ ...rawTx, gas: estimatedGas });
  }, [address, token, isApprovalNeeded, spender, wallet]);

  return { isApprovalNeeded, approve };
};
