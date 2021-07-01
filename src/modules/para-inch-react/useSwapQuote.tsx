import { useEffect, useCallback, useState, useMemo } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import ABI from 'human-standard-token-abi';
import { Big } from 'big.js';

import { logger } from '../logger';
import { useOnboard } from '../onboard';
import { getSwapQuote, SwapQuote, isNativeToken } from '../para-inch';

import { useParaInch } from './useParaInch';

const MAX_ALLOWANCE = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

export const useSwapQuote = () => {
  const { address, wallet } = useOnboard();
  const { fromToken, toToken, network, amount } = useParaInch();
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [isApprovalNeeded, setApprovalNeeded] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!fromToken || !toToken) {
      return;
    }

    const loadQuote = async () => {
      try {
        if (cancelled) return;

        setSwapQuote(null);
        const result = await getSwapQuote({
          fromToken,
          toToken,
          amount: amount ?? 1,
          network,
          sourceAddress: address,
          walletProvider: wallet?.provider,
        });

        if (cancelled) return;
        logger.debug({ swapQuote: result }, 'Got a swap quote');
        setSwapQuote(result);
      } catch (err) {
        logger.error({ err }, 'Failed to load swap quote');
        setTimeout(loadQuote, 2500);
      }
    };

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [fromToken, toToken, network, amount, address, wallet?.provider]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const contractAddress = swapQuote?.contractAddress;
      if (!fromToken || !contractAddress || !address || !wallet || !wallet.provider) {
        setApprovalNeeded(null);
        return;
      }

      if (isNativeToken(fromToken.address)) {
        setApprovalNeeded(false);
        return;
      }

      const web3 = new Web3(wallet.provider);
      const contract = new web3.eth.Contract(ABI, fromToken.address);

      const allowance = new Big(await contract.methods.allowance(address, contractAddress).call());
      const maxAllowance = new Big(MAX_ALLOWANCE.toString(10));

      if (cancelled) return;
      setApprovalNeeded(allowance.lt(maxAllowance));
    })();

    return () => {
      cancelled = true;
    };
  }, [address, wallet, swapQuote?.contractAddress, fromToken]);

  const approve = useCallback(async () => {
    if (!isApprovalNeeded) {
      throw new Error('Approval is not needed');
    }

    if (!address || !wallet || !wallet.provider) {
      throw new Error('No wallet connected');
    }

    const contractAddress = swapQuote?.contractAddress;
    if (!contractAddress) {
      throw new Error('No contract address to approve');
    }

    if (!fromToken) {
      throw new Error('No token to approve');
    }

    const web3 = new Web3(wallet.provider);
    const contract = new web3.eth.Contract(ABI, fromToken.address);

    const gasPrice = await web3.eth.getGasPrice();
    const rawTx: TransactionConfig = {
      nonce: await web3.eth.getTransactionCount(address),
      gasPrice: web3.utils.toHex(gasPrice),
      from: address,
      to: fromToken.address,
      value: '0x0',
      data: contract.methods.approve(contractAddress, MAX_ALLOWANCE).encodeABI(),
    };

    const estimatedGas = await web3.eth.estimateGas(rawTx);
    return await web3.eth.sendTransaction({ ...rawTx, gas: estimatedGas });
  }, [address, fromToken, isApprovalNeeded, swapQuote?.contractAddress, wallet]);

  const swap = useMemo(() => {
    if (!address || !wallet || !wallet.provider) {
      return null;
    }

    if (isApprovalNeeded) {
      return null;
    }

    const provider = wallet.provider;
    const transaction = swapQuote?.transaction;
    if (!transaction) {
      return null;
    }

    return async () => {
      const web3 = new Web3(provider);
      return await web3.eth.sendTransaction(transaction);
    };
  }, [isApprovalNeeded, swapQuote?.transaction, address, wallet]);

  return { swapQuote, isApprovalNeeded, approve, swap };
};
