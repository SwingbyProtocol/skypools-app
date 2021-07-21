import Web3 from 'web3';
import abiDecoder from 'abi-decoder';
import erc20Abi from 'human-standard-token-abi';
import { Big, BigSource } from 'big.js';
import { stringifyUrl } from 'query-string';

import { shouldUseParaSwap } from '../../env';
import { Network } from '../../onboard';
import { fetcher } from '../../fetch';
import { getScanApiUrl } from '../../web3';
import { logger as baseLogger } from '../../logger';
import { isNativeToken } from '../isNativeToken';

import oneInchAbi from './one-inch-abi.json';
import paraSwapAbi from './paraswap-abi.json';

type TransactionDetails = {
  fromTokenAddress: string | null;
  toTokenAddress: string | null;
  fromAmount: Big | null;
  toAmount: Big | null;
};

type Params = {
  network: Network;
  hash: string;
  walletProvider: any;
};

const abi = shouldUseParaSwap ? paraSwapAbi : oneInchAbi;
abiDecoder.addABI(abi);

export const getTransactionDetails = async ({
  network,
  hash,
  walletProvider,
}: Params): Promise<TransactionDetails> => {
  const logger = baseLogger.child({ hash });

  const web3 = new Web3(walletProvider);
  const receipt = await web3.eth.getTransactionReceipt(hash);

  const logs = abiDecoder.decodeLogs(receipt.logs);
  const events = logs?.find?.((it: any) => it.name === 'Swapped')?.events ?? [];

  if (events.length > 0) {
    logger.debug('Found "Swapped" event');

    const fromTokenAddress = findLogValue(events, 'srcToken');
    const toTokenAddress = findLogValue(events, shouldUseParaSwap ? 'destToken' : 'dstToken');

    const fromAmount = await parseAmount({
      amount: findLogValue(events, shouldUseParaSwap ? 'srcAmount' : 'spentAmount'),
      tokenAddress: fromTokenAddress,
      web3,
      logger,
    });
    const toAmount = await parseAmount({
      amount: findLogValue(events, shouldUseParaSwap ? 'receivedAmount' : 'returnAmount'),
      tokenAddress: toTokenAddress,
      web3,
      logger,
    });

    return { fromTokenAddress, toTokenAddress, fromAmount, toAmount };
  }

  logger.debug('Did not find "Swapped" event');
  const transaction = await web3.eth.getTransaction(hash);
  const input = await abiDecoder.decodeMethod(transaction.input);

  const fromTokenAddress = input.params.find((it: any) => it.name === 'path').value[0];
  const toTokenAddress = input.params.find((it: any) => it.name === 'path').value[1];

  const fromAmount = await parseAmount({
    amount: transaction.value,
    tokenAddress: fromTokenAddress,
    web3,
    logger,
  });
  const toAmount = await getToAmountFromScan({
    hash,
    network,
    toTokenAddress,
    receivingAddress: transaction.from,
    logger,
  });

  return { fromAmount, toAmount, fromTokenAddress, toTokenAddress };
};

const findLogValue = (logs: { name: string; type: string; value: string }[], name: string) => {
  return logs.find((it) => it.name === name)?.value ?? null;
};

const parseAmount = async ({
  amount,
  tokenAddress,
  web3,
  logger,
}: {
  amount: BigSource | null;
  tokenAddress: string | null;
  web3: Web3;
  logger: typeof baseLogger;
}): Promise<Big | null> => {
  if (!tokenAddress) return null;
  if (!amount) return null;

  try {
    const decimals = await (async () => {
      if (isNativeToken(tokenAddress)) return 18;

      const contract = new web3.eth.Contract(erc20Abi, tokenAddress);
      return await contract.methods.decimals().call();
    })();

    return new Big(amount).div(`1e${decimals}`);
  } catch (err) {
    logger.trace({ amount, tokenAddress, err }, 'Failed to parse amount');
    return null;
  }
};

const getToAmountFromScan = async ({
  network,
  toTokenAddress,
  hash,
  receivingAddress,
  logger,
}: {
  network: Network;
  toTokenAddress: string;
  hash: string;
  receivingAddress: string;
  logger: typeof baseLogger;
}): Promise<Big | null> => {
  try {
    const result = await fetcher<{
      result: Array<{ hash: string; value: string; tokenDecimal: string }>;
    }>(
      stringifyUrl({
        url: getScanApiUrl({ network }),
        query: {
          module: 'account',
          action: 'tokentx',
          contractaddress: toTokenAddress,
          address: receivingAddress,
        },
      }),
    );

    const tx = result.result.find((it) => it.hash === hash);
    if (!tx) return null;

    return new Big(tx.value).div(`1e${tx.tokenDecimal}`);
  } catch (err) {
    logger.trace({ err }, 'Failed to get "toAmount" from scan API');
    return null;
  }
};
