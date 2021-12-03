import { useEffect, useMemo, useState, useCallback } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { ethers } from 'ethers';

import { SwapDocument, useSwapQuery } from '../../generated/skypools-graphql';
import { logger } from '../logger';
import { useOnboard } from '../onboard';
import { buildSkypoolsContract, getSkypoolsContractAddress } from '../para-inch';

import { useSkybridgeSwap } from './useSkybridgeSwap';
import { dataSpParaSwapBTC2Token, simpleSwapPriceRoute } from './paraSkypools';

export const useSkypools = ({ swapId, slippage }: { swapId: string; slippage: string }) => {
  const { address, wallet, network: onboardNetwork } = useOnboard();

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

  const getMinSwapAmount = useCallback(async () => {
    if (!wallet || !address || !data) return;
    try {
      const { minAmount, priceRoute } = await simpleSwapPriceRoute({
        swapQuery: data,
        wbtcSrcAmount,
        slippage,
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
  }, [wallet, data, address, slippage, wbtcSrcAmount]);

  useEffect(() => {
    getMinSwapAmount();

    const interval = setInterval(() => {
      getMinSwapAmount();
    }, 10000);

    return () => clearInterval(interval);
  }, [getMinSwapAmount]);

  return useMemo(() => {
    return {
      wbtcSrcAmount,
      minAmount,
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
        const web3 = new Web3(wallet.provider);
        const contractAddress = network && getSkypoolsContractAddress(network);
        const contract = buildSkypoolsContract({ provider: wallet.provider, network });
        if (isBtcToToken) {
          const arg = await dataSpParaSwapBTC2Token({
            slippage,
            wbtcSrcAmount,
            userAddress: initiatorAddress,
            swapQuery: data,
          });

          const transaction: TransactionConfig = {
            nonce: await web3.eth.getTransactionCount(address),
            value: '0x0',
            from: address,
            to: contractAddress,
            data: contract.methods.spParaSwapBTC2Token(arg).encodeABI(),
          };

          const gasPrice = await web3.eth.getGasPrice();
          const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
          logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');
          // Todo: Change swap.status from "PENDING" to "COMPLETED" once the transaction success
          return web3.eth.sendTransaction({ ...transaction, gasPrice, gas });
        } else {
          // Token to BTC
          // Todo
        }
      },
    };
  }, [address, onboardNetwork, wallet, data, wbtcSrcAmount, isBtcToToken, slippage, minAmount]);
};
