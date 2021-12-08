import { useEffect, useMemo, useState, useCallback } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { ethers } from 'ethers';

import { SwapDocument, useSwapQuery } from '../../generated/skypools-graphql';
import { logger } from '../logger';
import { useOnboard } from '../onboard';
import { buildSkypoolsContract, getERC20Symbol, getSkypoolsContractAddress } from '../para-inch';

import { simpleSwapPriceRoute, txDataSpSimpleSwap } from './paraSkypools';
import { useSkybridgeSwap } from './useSkybridgeSwap';

import { useSkypoolsFloats } from '.';

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

  const { floats } = useSkypoolsFloats();
  const [isFloatShortage, setIsFloatShortage] = useState<boolean>(false);

  const isBtcToToken = data?.swap.srcToken.symbol === 'BTC';
  const contractAddress = onboardNetwork && getSkypoolsContractAddress(onboardNetwork);

  const swapSrc = useMemo(
    () => ({
      amount: isBtcToToken ? wbtcSrcAmount : data?.swap.srcAmount,
      token: isBtcToToken ? 'WBTC' : getERC20Symbol(data?.swap.srcToken.symbol ?? ''),
    }),
    [data, isBtcToToken, wbtcSrcAmount],
  );

  const getSwapAmount = useCallback(async () => {
    if (!wallet || !address || !data || !contractAddress) return;
    try {
      const { minAmount, priceRoute } = await simpleSwapPriceRoute({
        swapQuery: data,
        wbtcSrcAmount,
        slippage,
        isBtcToToken,
        skypoolsAddress: contractAddress,
      });

      setMiniAmount({
        amount: ethers.utils.formatUnits(minAmount, priceRoute.destDecimals),
        token: data.swap.destToken.symbol,
      });

      const skybridgeFloat = isBtcToToken ? floats.wrappedBtc : floats.btc;
      const spRequiredFloatAmount = isBtcToToken
        ? wbtcSrcAmount
        : ethers.utils.formatUnits(priceRoute.destAmount, priceRoute.destDecimals);

      setIsFloatShortage(Number(spRequiredFloatAmount) > Number(skybridgeFloat));
    } catch (error) {
      logger.error(error);
      setMiniAmount({
        amount: '',
        token: '',
      });
    }
  }, [wallet, data, address, slippage, wbtcSrcAmount, isBtcToToken, contractAddress, floats]);

  useEffect(() => {
    getSwapAmount();

    const interval = setInterval(() => {
      getSwapAmount();
    }, 10000);

    return () => clearInterval(interval);
  }, [getSwapAmount]);

  return useMemo(() => {
    return {
      minAmount,
      isFloatShortage,
      isBtcToToken,
      btcAddress,
      setBtcAddress,
      swapSrc,
      status: data?.swap.status,
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

        const transaction: TransactionConfig = {
          nonce: await web3.eth.getTransactionCount(address),
          value: '0x0',
          from: address,
          to: contractAddress,
          data: isBtcToToken
            ? contract.methods.spFlow1SimpleSwap(arg).encodeABI()
            : contract.methods.spFlow2SimpleSwap(btcAddress, arg).encodeABI(),
        };

        const gasPrice = await web3.eth.getGasPrice();
        const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
        logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');

        // Todo: Change swap.status from "PENDING" to "COMPLETED" and store transaction hash to DB
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
    isFloatShortage,
  ]);
};
