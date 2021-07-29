import Web3 from 'web3';
import abiDecoder from 'abi-decoder';
import erc20Abi from 'human-standard-token-abi';
import { stringifyUrl } from 'query-string';
import { Prisma, SwapHistoric } from '@prisma/client';

import { shouldUseParaSwap } from '../../env';
import { Network } from '../../networks';
import { fetcher } from '../../fetch';
import { getScanApiUrl } from '../../web3';
import { logger as baseLogger } from '../../logger';
import { isNativeToken } from '../../para-inch';
import { buildWeb3Instance } from '../../server__web3';
import { buildTokenId } from '../getTokens';

import oneInchAbi from './one-inch-abi.json';
import paraSwapAbi from './paraswap-abi.json';

type TransactionDetails = Pick<
  SwapHistoric,
  'srcAmount' | 'srcTokenId' | 'destAmount' | 'destTokenId'
>;

type Params = {
  network: Network;
  hash: string;
};

interface IScanTxHistory {
  status: string;
  message: string;
  result: ITxHistory[];
}

interface ITxHistory {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

const abi = shouldUseParaSwap ? paraSwapAbi : oneInchAbi;
abiDecoder.addABI(abi);

export const getSwapDetails = async ({ network, hash }: Params): Promise<TransactionDetails> => {
  const logger = baseLogger.child({ hash });

  const web3 = buildWeb3Instance({ network });
  const receipt = await web3.eth.getTransactionReceipt(hash);

  const logs = abiDecoder.decodeLogs(receipt.logs);
  const events = logs?.find?.((it: any) => it.name === 'Swapped')?.events ?? [];

  if (events.length > 0) {
    logger.debug('Found "Swapped" event');

    const srcTokenAddress = findLogValue(events, 'srcToken');
    const destTokenAddress = findLogValue(events, shouldUseParaSwap ? 'destToken' : 'dstToken');

    return {
      srcTokenId: srcTokenAddress ? buildTokenId({ network, tokenAddress: srcTokenAddress }) : null,
      destTokenId: destTokenAddress
        ? buildTokenId({ network, tokenAddress: destTokenAddress })
        : null,
      srcAmount: await parseAmount({
        amount: findLogValue(events, shouldUseParaSwap ? 'srcAmount' : 'spentAmount'),
        tokenAddress: srcTokenAddress,
        web3,
        logger,
      }),
      destAmount: await parseAmount({
        amount: findLogValue(events, shouldUseParaSwap ? 'receivedAmount' : 'returnAmount'),
        tokenAddress: destTokenAddress,
        web3,
        logger,
      }),
    };
  }

  logger.debug('Did not find "Swapped" event');
  const transaction = await web3.eth.getTransaction(hash);
  const input = await abiDecoder.decodeMethod(transaction.input);

  const srcTokenAddress = input.params.find((it: any) => it.name === 'path').value[0];
  const destTokenAddress = input.params.find((it: any) => it.name === 'path').value[1];

  const amountSendOut = input.params.find((it: any) => it.name === 'amountIn').value;
  const receivingAddress = transaction.from.toLowerCase();

  return {
    srcTokenId: srcTokenAddress ? buildTokenId({ network, tokenAddress: srcTokenAddress }) : null,
    destTokenId: destTokenAddress
      ? buildTokenId({ network, tokenAddress: destTokenAddress })
      : null,
    srcAmount: await parseAmount({
      amount: amountSendOut,
      tokenAddress: srcTokenAddress,
      web3,
      logger,
    }),
    destAmount: await getToAmountFromScan({
      hash,
      network,
      toTokenAddress: destTokenAddress,
      receivingAddress,
      logger,
    }),
  };
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
  amount: Prisma.Decimal.Value | null;
  tokenAddress: string | null;
  web3: Web3;
  logger: typeof baseLogger;
}): Promise<Prisma.Decimal | null> => {
  if (!tokenAddress) return null;
  if (!amount) return null;

  try {
    const decimals = await (async () => {
      if (isNativeToken(tokenAddress)) return 18;

      const contract = new web3.eth.Contract(erc20Abi, tokenAddress);
      return await contract.methods.decimals().call();
    })();

    return new Prisma.Decimal(amount).div(`1e${decimals}`);
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
}): Promise<Prisma.Decimal | null> => {
  const etherscanApiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API;
  const bscscanApiKey = process.env.NEXT_PUBLIC_BSCSCAN_API;
  const nativeToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  const apikey =
    network === 'BSC' ? bscscanApiKey : network === 'ETHEREUM' ? etherscanApiKey : null;

  try {
    if (toTokenAddress === nativeToken) {
      // Memo: swap contract sent the native token to user. (doesn't record in 'logs')

      const resultInternalTx = await fetcher<IScanTxHistory>(
        stringifyUrl({
          url: getScanApiUrl({ network }),
          query: {
            module: 'account',
            action: 'txlistinternal',
            txhash: hash,
            apikey,
          },
        }),
      );

      const tx = resultInternalTx.result.find(
        (it: ITxHistory) => it.to.toLowerCase() === receivingAddress,
      );
      const decimals = 18;
      if (!tx) return null;
      return new Prisma.Decimal(tx.value).div(`1e${decimals}`);
    } else {
      const result = await fetcher<IScanTxHistory>(
        stringifyUrl({
          url: getScanApiUrl({ network }),
          query: {
            module: 'account',
            action: 'tokentx',
            contractaddress: toTokenAddress,
            address: receivingAddress,
            apikey,
          },
        }),
      );

      const tx = result.result.find((it: ITxHistory) => it.hash === hash);
      if (!tx) return null;
      return new Prisma.Decimal(tx.value).div(`1e${tx.tokenDecimal}`);
    }
  } catch (err) {
    logger.trace({ err }, 'Failed to get "toAmount" from scan API');
    return null;
  }
};
