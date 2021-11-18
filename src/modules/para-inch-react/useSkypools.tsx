import { useMemo } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';

import { useSwapQuery, SwapDocument } from '../../generated/skypools-graphql';
import { logger } from '../logger';
import { useOnboard } from '../onboard';
import {
  useSkybridgeSwap,
  getSkypoolsContractAddress,
  buildSkypoolsContract,
  dataSpParaSwapBTC2Token,
} from '../skypools';

export const useSkypools = (swapId: string) => {
  const { address, wallet, network: onboardNetwork } = useOnboard();
  const { data } = useSwapQuery({
    query: SwapDocument,
    variables: { id: swapId },
  });
  const { claimableWbtc } = useSkybridgeSwap(data?.swap.skybridgeSwapId ?? '');

  return useMemo(() => {
    return {
      handleClaim: async () => {
        if (!data || !data.swap) {
          return;
        }
        const { network, srcToken, initiatorAddress } = data.swap;
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
        const isBtcToToken = srcToken.symbol === 'BTC';
        if (isBtcToToken) {
          // Let's get from db
          const slippage = '1';
          const arg = await dataSpParaSwapBTC2Token({
            slippage,
            claimableWbtc,
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
  }, [address, onboardNetwork, wallet, data, claimableWbtc]);
};
