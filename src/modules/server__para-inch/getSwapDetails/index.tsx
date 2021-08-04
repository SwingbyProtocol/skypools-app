import { Prisma, SwapHistoric } from '@prisma/client';
import abiDecoder from 'abi-decoder';
import erc20Abi from 'human-standard-token-abi';
import Web3 from 'web3';

import { shouldUseParaSwap } from '../../env';
import { logger as baseLogger } from '../../logger';
import { Network } from '../../networks';
import { isNativeToken, NATIVE_TOKEN_ADDRESS } from '../../para-inch';
import { buildWeb3Instance, scanApiFetcher } from '../../server__web3';
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
  logger: typeof baseLogger;
};

const abi = shouldUseParaSwap ? paraSwapAbi : oneInchAbi;
abiDecoder.addABI(abi);

export const getSwapDetails = async ({
  network,
  hash,
  logger: loggerParam = baseLogger,
}: Params): Promise<TransactionDetails> => {
  const logger = loggerParam.child({ hash });

  const web3 = buildWeb3Instance({ network });
  const receipt = await web3.eth.getTransactionReceipt(hash);
  if (!receipt) {
    throw new Error(`No receipt found for "${hash}"`);
  }

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
  const functionName = input.name;

  if (functionName === 'unoswap') {
    const srcTokenAddress = input.params
      .find((it: any) => it.name === 'srcToken')
      .value.toLowerCase();
    const destTokenAddress = NATIVE_TOKEN_ADDRESS;
    const srcAmount = input.params.find((it: any) => it.name === 'amount').value;
    const receivingAddress = transaction.from.toLowerCase();

    return {
      srcTokenId: srcTokenAddress ? buildTokenId({ network, tokenAddress: srcTokenAddress }) : null,
      destTokenId: destTokenAddress
        ? buildTokenId({ network, tokenAddress: destTokenAddress })
        : null,
      srcAmount: await parseAmount({
        amount: srcAmount,
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
  }

  // Memo: functionName === 'swapOnUniswap' || functionName === 'swapOnUniswapFork'
  const srcTokenAddress = input.params.find((it: any) => it.name === 'path').value[0];
  const destTokenAddress = input.params.find((it: any) => it.name === 'path').value[1];
  const srcAmount = input.params.find((it: any) => it.name === 'amountIn').value;
  const receivingAddress = transaction.from.toLowerCase();

  return {
    srcTokenId: srcTokenAddress ? buildTokenId({ network, tokenAddress: srcTokenAddress }) : null,
    destTokenId: destTokenAddress
      ? buildTokenId({ network, tokenAddress: destTokenAddress })
      : null,
    srcAmount: await parseAmount({
      amount: srcAmount,
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
  try {
    if (isNativeToken(toTokenAddress)) {
      const resultInternalTx = await scanApiFetcher<ApiResult>({
        network,
        query: {
          module: 'account',
          action: 'txlistinternal',
          txhash: hash,
        },
      });

      const tx = resultInternalTx.result.find((it) => it.to.toLowerCase() === receivingAddress);

      if (!tx) return null;
      return new Prisma.Decimal(tx.value).div('1e18');
    }

    const result = await scanApiFetcher<ApiResult>({
      network,
      query: {
        module: 'account',
        action: 'tokentx',
        contractaddress: toTokenAddress,
        address: receivingAddress,
      },
    });

    const tx = result.result.find((it) => it.hash === hash);
    if (!tx) return null;

    return new Prisma.Decimal(tx.value).div(`1e${tx.tokenDecimal}`);
  } catch (err) {
    logger.trace({ err }, 'Failed to get "toAmount" from scan API');
    return null;
  }

  type ApiResult = {
    result: Array<{
      hash: string;
      to: string;
      value: string;
      tokenDecimal: string;
    }>;
  };
};

const swapFunctions = [
  'swapOnUniswap', // paraswap function
  'swapOnUniswapFork', // paraswap function
  'simpleSwap', // paraswap event
  'megaSwap', // paraswap event
  'multiSwap', // paraswap event
  'swap', // 1inch event
  'unoswap', // 1inch function
];

export const isSwapTx = async ({
  network,
  hash,
  logger: loggerParam = baseLogger,
}: Params): Promise<boolean> => {
  try {
    const web3 = buildWeb3Instance({ network });
    const transaction = await web3.eth.getTransaction(hash);
    const input = await abiDecoder.decodeMethod(transaction.input);
    const functionName = input.name;
    return swapFunctions.includes(functionName);
  } catch (err) {
    const logger = loggerParam.child({ hash });
    logger.trace({ network, hash, err }, 'Failed to parse transaction');
    return false;
  }
};
