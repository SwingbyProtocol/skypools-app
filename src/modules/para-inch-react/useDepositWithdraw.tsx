import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { Big } from 'big.js';

import { CoinInfo } from '../../components/CoinInput';
import { logger } from '../logger';
import { useOnboard } from '../onboard';
import {
  buildSkypoolsContract,
  getERC20Address,
  getSkypoolsContractAddress,
  getWrappedBtcAddress,
  isFakeBtcToken,
  isFakeNativeToken,
} from '../para-inch';

import { useParaInchSwapApproval } from './useParaInchSwapApproval';

export const useDepositWithdraw = (coinInfo: CoinInfo | null) => {
  const { address, wallet, network } = useOnboard();
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [depositedBalance, setDepositedBalance] = useState<{ balance: string; token: string }>({
    balance: '',
    token: '',
  });

  const { isApprovalNeeded, approve } = useParaInchSwapApproval({
    token: coinInfo?.address,
    spender: getSkypoolsContractAddress(network ?? 'ETHEREUM'),
    network,
  });

  const isFromBtc = coinInfo?.symbol === 'BTC';

  const depositedInformation = useCallback(async () => {
    if (!wallet || !address || !network || !coinInfo) return;

    const contract = buildSkypoolsContract({ provider: wallet.provider, network });

    const token = isFakeBtcToken(coinInfo.address)
      ? getWrappedBtcAddress({ network })
      : getERC20Address({ network, tokenAddress: coinInfo.address });

    const rawBal = await contract.methods.balanceOf(token, address).call();
    const decimals = coinInfo.decimals;
    const balance = ethers.utils.formatUnits(rawBal, decimals);

    return { contract, token, balance, rawBal, decimals };
  }, [address, wallet, network, coinInfo]);

  const updateDepositedBalance = useCallback(async () => {
    try {
      const info = await depositedInformation();
      if (!info || !coinInfo) return;

      setDepositedBalance({
        balance: info.balance,
        token: coinInfo.symbol,
      });
    } catch (error) {
      logger.error(error);
      setDepositedBalance({
        balance: '',
        token: '',
      });
    }
  }, [depositedInformation, coinInfo]);

  useEffect(() => {
    updateDepositedBalance();

    const interval = setInterval(() => {
      updateDepositedBalance();
    }, 20000);

    return () => clearInterval(interval);
  }, [updateDepositedBalance]);

  return useMemo(() => {
    return {
      isApprovalNeeded: isFromBtc ? false : isApprovalNeeded,
      approve,
      depositedBalance,
      setAmount,
      amount,
      isLoading,
      errorMsg,
      handleDeposit: async () => {
        try {
          setIsLoading(true);
          if (!coinInfo || !wallet || !network || !address) return;
          // setIsLoading(true);
          if (isFakeBtcToken(coinInfo.address)) {
            // Todo
            //   const context = await buildContext({
            //     mode: network === Network.ROPSTEN ? 'test' : 'production',
            //   });
            //   const { hash } = await createSkybridgeSwap({
            //     context,
            //     addressReceiving: address,
            //     amountDesired: swapQuote.srcTokenAmount,
            //     currencyDeposit: 'BTC',
            //     currencyReceiving: network === 'BSC' ? 'BTCB.BEP20' : 'WBTC',
            //     isSkypoolsSwap: true,
            //   });
          } else {
            console.log('ERC20 deposit');
            const web3 = new Web3(wallet.provider);
            const contract = buildSkypoolsContract({ provider: wallet.provider, network });
            const isNativeToken = isFakeNativeToken(coinInfo.address);

            const contractAddress = getSkypoolsContractAddress(network);

            const data = contract.methods
              .spDeposit(
                coinInfo.address,
                isNativeToken
                  ? '0'
                  : web3.utils.toHex(new Big(amount).times(`1e${coinInfo.decimals}`).toFixed()),
              )
              .encodeABI();

            const transaction: TransactionConfig = {
              nonce: await web3.eth.getTransactionCount(address),
              value: isNativeToken ? web3.utils.toWei(amount) : '0x0',
              from: address,
              to: contractAddress,
              data,
            };
            const gasPrice = await web3.eth.getGasPrice();
            const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
            logger.debug(
              { transaction: { ...transaction, gas, gasPrice } },
              'Will send transaction',
            );
            return web3.eth.sendTransaction({ ...transaction, gasPrice, gas });
          }
        } catch (err: any) {
          logger.error(err);
          setErrorMsg(err.message);
        } finally {
          setIsLoading(false);
        }
      },
      handleWithdraw: async () => {
        const info = await depositedInformation();
        if (!info) {
          throw Error('Something went wrong');
        }
        const { contract, token, decimals } = info;

        if (!address || !wallet || !wallet.provider) {
          throw new Error('No wallet connected');
        }

        const contractAddress = network && getSkypoolsContractAddress(network);
        if (!contractAddress) {
          throw new Error('Contract address was not defined');
        }

        const web3 = new Web3(wallet.provider);
        const redeemAmount = ethers.utils.parseUnits(amount, decimals);
        const transaction: TransactionConfig = {
          nonce: await web3.eth.getTransactionCount(address),
          value: '0x0',
          from: address,
          to: contractAddress,
          data: contract.methods.redeemERC20Token(token, redeemAmount).encodeABI(),
        };

        const gasPrice = await web3.eth.getGasPrice();
        const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
        logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');
        return web3.eth.sendTransaction({ ...transaction, gasPrice, gas });
      },
    };
  }, [
    depositedBalance,
    address,
    depositedInformation,
    network,
    wallet,
    setAmount,
    amount,
    isLoading,
    errorMsg,
    setErrorMsg,
    coinInfo,
    approve,
    isApprovalNeeded,
    isFromBtc,
  ]);
};
