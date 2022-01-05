import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { Big } from 'big.js';
import { buildContext, createSwap } from '@swingby-protocol/sdk';
import { useRouter } from 'next/router';
import ABI from 'human-standard-token-abi';

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
import { addBtcDeposits } from '../localstorage';
import { buildLinkToTransaction } from '../web3';

import { useParaInchSwapApproval } from './useParaInchSwapApproval';

export const useDepositWithdraw = (coinInfo: CoinInfo | null) => {
  const { address, wallet, network, onboard } = useOnboard();
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const { push, pathname } = useRouter();
  const isDeposit = pathname.includes('/deposit');
  const [explorerLink, setExplorerLink] = useState<string>('');

  const [depositedBalance, setDepositedBalance] = useState<{ amount: string; token: string }>({
    amount: '',
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
        amount: info.balance,
        token: coinInfo.symbol,
      });
    } catch (error) {
      logger.error(error);
      setDepositedBalance({
        amount: '',
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

  const walletCheck = useCallback(async () => {
    if (!onboard) {
      throw Error('Cannot detect onboard');
    }

    const result = await onboard?.walletCheck();
    if (!result) {
      throw Error('Invalid wallet connection');
    }
  }, [onboard]);

  useEffect(() => {
    setErrorMsg('');
    setExplorerLink('');
  }, [coinInfo, amount]);

  useEffect(() => {
    setAmount('');
  }, [coinInfo]);

  useEffect(() => {
    if (!network) return;
    const availableNetwork = ['ROPSTEN'];
    if (!availableNetwork.includes(network)) {
      setErrorMsg('Currently, SkyPools supports Ropsten testnet only');
      return;
    }

    setErrorMsg('');
  }, [network]);

  const getWalletBalance = useCallback(async () => {
    if (!wallet || !coinInfo || !address || !network) return;
    const web3 = new Web3(wallet.provider);
    return await (async () => {
      if (isFakeNativeToken(coinInfo.address)) {
        return web3.utils.fromWei(await web3.eth.getBalance(address), 'ether');
      }

      const contract = new web3.eth.Contract(ABI, coinInfo.address);
      const rawBalance = await contract.methods.balanceOf(address).call();
      return ethers.utils.formatUnits(rawBalance, coinInfo.decimals);
    })();
  }, [address, coinInfo, wallet, network]);

  const toMaxAmount = useCallback(async () => {
    if (!isDeposit) {
      if (!depositedBalance.amount) return;
      setAmount(depositedBalance.amount);
    } else {
      const balance = (await getWalletBalance()) ?? '0';
      setAmount(balance);
    }
  }, [setAmount, getWalletBalance, depositedBalance, isDeposit]);

  return useMemo(() => {
    return {
      isApprovalNeeded: isFromBtc ? false : isApprovalNeeded,
      approve,
      isDeposit,
      explorerLink,
      depositedBalance,
      setAmount,
      toMaxAmount,
      amount,
      isLoading,
      errorMsg,
      handleDeposit: async () => {
        try {
          setIsLoading(true);
          if (!coinInfo || !wallet || !network || !address) return;
          if (isFakeBtcToken(coinInfo.address)) {
            const context = await buildContext({
              mode: network === 'ROPSTEN' ? 'test' : 'production',
            });
            const { hash } = await createSwap({
              context,
              addressReceiving: address,
              amountDesired: amount,
              currencyDeposit: 'BTC',
              currencyReceiving: network === 'BSC' ? 'BTCB.BEP20' : 'WBTC',
              isSkypoolsSwap: true,
            });
            addBtcDeposits({
              amount,
              hash,
              mode: network === 'ROPSTEN' ? 'test' : 'production',
            });
            return push(`/deposit/${hash}`);
          } else {
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

            await walletCheck();
            return web3.eth
              .sendTransaction({ ...transaction, gasPrice, gas })
              .once('transactionHash', (transactionHash) => {
                const url = buildLinkToTransaction({ network, transactionHash });
                setExplorerLink(url);
              });
          }
        } catch (err: any) {
          logger.error(err);
          setErrorMsg(err.message);
        } finally {
          setIsLoading(false);
        }
      },
      handleWithdraw: async () => {
        try {
          setIsLoading(true);

          if (!coinInfo) return;
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
            data: isFakeNativeToken(coinInfo.address)
              ? contract.methods.redeemEther(redeemAmount).encodeABI()
              : contract.methods.redeemERC20Token(token, redeemAmount).encodeABI(),
          };

          const gasPrice = await web3.eth.getGasPrice();
          const gas = await web3.eth.estimateGas({ ...transaction, gasPrice });
          logger.debug({ transaction: { ...transaction, gas, gasPrice } }, 'Will send transaction');

          await walletCheck();
          return web3.eth
            .sendTransaction({ ...transaction, gasPrice, gas })
            .once('transactionHash', (transactionHash) => {
              const url = buildLinkToTransaction({ network, transactionHash });
              setExplorerLink(url);
            });
        } catch (err: any) {
          logger.error(err);
          setErrorMsg(err.message);
        } finally {
          setIsLoading(false);
        }
      },
    };
  }, [
    isDeposit,
    explorerLink,
    depositedBalance,
    address,
    depositedInformation,
    network,
    wallet,
    setAmount,
    toMaxAmount,
    amount,
    isLoading,
    errorMsg,
    setErrorMsg,
    coinInfo,
    approve,
    isApprovalNeeded,
    isFromBtc,
    walletCheck,
    push,
  ]);
};
