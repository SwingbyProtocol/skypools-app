import { useEffect, useMemo, useState, useCallback } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { ethers } from 'ethers';

import { SwapDocument, useSwapQuery } from '../../generated/skypools-graphql';
import { logger } from '../logger';
import { useOnboard } from '../onboard';
import {
  buildSkypoolsContract,
  txDataSpSimpleSwap,
  getSkypoolsContractAddress,
  simpleSwapPriceRoute,
  useSkybridgeSwap,
} from '../skypools';
import { getERC20Symbol } from '../para-inch';

export const useSkypools = ({ swapId, slippage }: { swapId: string; slippage: string }) => {
  const { address, wallet, network: onboardNetwork } = useOnboard();
  const [btcAddress, setBtcAddress] = useState<string>('');

  const { data } = useSwapQuery({
    query: SwapDocument,
    variables: { id: swapId },
  });

  const { wbtcSrcAmount } = useSkybridgeSwap(data?.swap.skybridgeSwapId ?? '');

  const [minAmount, setMiniAmount] = useState<{ amount: string; token: string }>({
    amount: '',
    token: '',
  });

  const isBtcToToken = data?.swap.srcToken.symbol === 'BTC';
  const contractAddress = onboardNetwork && getSkypoolsContractAddress(onboardNetwork);

  const swapSrc = useMemo(
    () => ({
      amount: isBtcToToken ? wbtcSrcAmount : data?.swap.srcAmount,
      token: isBtcToToken ? 'WBTC' : getERC20Symbol(data?.swap.srcToken.symbol ?? ''),
    }),
    [data, isBtcToToken, wbtcSrcAmount],
  );

  const getMinSwapAmount = useCallback(async () => {
    if (!wallet || !address || !data || !contractAddress) return;
    try {
      const { minAmount, priceRoute } = await simpleSwapPriceRoute({
        swapQuery: data,
        wbtcSrcAmount,
        slippage,
        isBtcToToken,
        skypoolsAddress: contractAddress,
      });
      const amount = ethers.utils.formatUnits(minAmount, priceRoute.destDecimals);
      setMiniAmount({
        amount,
        token: data.swap.destToken.symbol,
      });
    } catch (error) {
      logger.error(error);
      setMiniAmount({
        amount: '',
        token: '',
      });
    }
  }, [wallet, data, address, slippage, wbtcSrcAmount, isBtcToToken, contractAddress]);

  useEffect(() => {
    getMinSwapAmount();

    const interval = setInterval(() => {
      getMinSwapAmount();
    }, 10000);

    return () => clearInterval(interval);
  }, [getMinSwapAmount]);

  return useMemo(() => {
    return {
      minAmount,
      isBtcToToken,
      btcAddress,
      setBtcAddress,
      swapSrc,
      handleClaim: async () => {
        if (!data || !data.swap) {
          return;
        }
        const { network, initiatorAddress } = data.swap;
        if (!address || !wallet || !wallet.provider) {
          throw new Error('No wallet connected');
        }
        if (network !== onboardNetwork) {
          throw new Error("Swap network does not match wallet's network");
        }
        if (network !== onboardNetwork) {
          throw new Error("Swap network does not match wallet's network");
        }
        if (!contractAddress) {
          throw new Error('Contract address was not defined');
        }
        const web3 = new Web3(wallet.provider);
        const contract = buildSkypoolsContract({ provider: wallet.provider, network });

        const arg = await txDataSpSimpleSwap({
          slippage,
          wbtcSrcAmount,
          userAddress: initiatorAddress,
          swapQuery: data,
          isBtcToToken,
          skypoolsAddress: contractAddress,
        });

        let transaction: TransactionConfig;
        if (isBtcToToken) {
          transaction = {
            nonce: await web3.eth.getTransactionCount(address),
            value: '0x0',
            from: address,
            to: contractAddress,
            data: contract.methods.spFlow1SimpleSwap(arg).encodeABI(),
          };
        } else {
          const bytes32BtcAddress = web3.utils.toHex(btcAddress);

          transaction = {
            nonce: await web3.eth.getTransactionCount(address),
            value: '0x0',
            from: address,
            to: contractAddress,
            data: contract.methods.spFlow2SimpleSwap(bytes32BtcAddress, arg).encodeABI(),
          };
        }

        const gasPrice = await web3.eth.getGasPrice();
        const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
        logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');

        // Todo: Change swap.status from "PENDING" to "COMPLETED" once the transaction success
        return web3.eth.sendTransaction({ ...transaction, gasPrice, gas });
      },
    };
  }, [
    address,
    onboardNetwork,
    wallet,
    data,
    wbtcSrcAmount,
    isBtcToToken,
    slippage,
    minAmount,
    contractAddress,
    setBtcAddress,
    btcAddress,
    swapSrc,
  ]);
};
