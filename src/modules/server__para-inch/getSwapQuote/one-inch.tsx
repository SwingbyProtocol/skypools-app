import { Prisma } from '@prisma/client';
import { stringifyUrl } from 'query-string';
import Web3 from 'web3';

import { fetcher } from '../../fetch';
import { getNetworkId } from '../../networks';
import { ENDPOINT_1INCH_API } from '../constants';
import { NATIVE_TOKEN_ADDRESS } from '../../para-inch';
import { prisma } from '../../server__env';
import { getPriceUsd } from '../coin-details';

import type { SwapQuote, GetSwapQuoteParams } from './types';

export const getOneInchSwapQuote = async ({
  beneficiaryAddress,
  destTokenAddress,
  initiatorAddress,
  network,
  srcTokenAddress,
  srcTokenAmount: srcTokenAmountParam,
}: GetSwapQuoteParams): Promise<SwapQuote> => {
  const { srcToken, destToken } = await (async () => {
    const web3 = new Web3();
    const srcToken = await prisma.token.findUnique({
      where: {
        network_address: { network, address: web3.utils.toChecksumAddress(srcTokenAddress) },
      },
    });
    if (!srcToken) {
      throw new Error(`Could not find token "${srcTokenAddress}" on network ${network}`);
    }

    const destToken = await prisma.token.findUnique({
      where: {
        network_address: { network, address: web3.utils.toChecksumAddress(destTokenAddress) },
      },
    });
    if (!destToken) {
      throw new Error(`Could not find token "${destTokenAddress}" on network ${network}`);
    }

    return { srcToken, destToken };
  })();

  const [nativeTokenPriceUsd, srcTokenPriceUsd, destTokenPriceUsd] = await Promise.all(
    [NATIVE_TOKEN_ADDRESS, srcTokenAddress, destTokenAddress].map((tokenAddress) =>
      getPriceUsd({ network, tokenAddress }),
    ),
  );

  const result = await fetcher<{
    toTokenAmount: string;
    fromTokenAmount: string;
    protocols: Array<
      Array<
        Array<{
          name: string;
          part: number;
          fromTokenAddress: string;
          toTokenAddress: string;
        }>
      >
    >;
    estimatedGas: number;
    tx?: {
      from: string;
      to: string;
      data: string;
      value: string;
      gasPrice: string;
      gas: number;
    };
  }>(
    stringifyUrl({
      url: `${ENDPOINT_1INCH_API}/${network}/swap`,
      query: {
        fromTokenAddress: srcToken.address,
        toTokenAddress: destToken.address,
        amount: srcTokenAmountParam.toFixed(),
        fromAddress: initiatorAddress,
        slippage: '0.05',
        destReceiver: beneficiaryAddress || undefined,
      },
    }),
  );

  if (!result.tx) {
    throw new Error('Did not get a "tx" object from 1inch');
  }

  const estimatedGas = new Prisma.Decimal(result.estimatedGas);
  const estimatedGasUsd = new Prisma.Decimal(estimatedGas).times(nativeTokenPriceUsd);
  const srcTokenAmount = new Prisma.Decimal(result.fromTokenAmount).div(`1e${srcToken.decimals}`);
  const srcTokenAmountUsd = new Prisma.Decimal(srcTokenAmount).times(srcTokenPriceUsd);
  const destTokenAmount = new Prisma.Decimal(result.toTokenAmount).div(`1e${destToken.decimals}`);
  const destTokenAmountUsd = new Prisma.Decimal(destTokenAmount).times(destTokenPriceUsd);

  const transaction: SwapQuote['bestRoute']['transaction'] = {
    ...result.tx,
    gas: `${result.tx.gas}`,
    chainId: getNetworkId(network),
  };

  return {
    srcTokenPriceUsd,
    destTokenPriceUsd,
    srcTokenAmount,
    srcTokenAmountUsd,
    otherExchanges: [],
    bestRoute: {
      fractionOfBest: new Prisma.Decimal(1),
      spender: transaction.to,
      transaction,
      estimatedGas,
      destTokenAmountUsd,
      estimatedGasUsd,
      destTokenAmount,
      path: result.protocols[0].map((it) =>
        it.map((it): SwapQuote['bestRoute']['path'][number][number] => ({
          exchange: it.name,
          fraction: (() => {
            try {
              return new Prisma.Decimal(it.part).div(100);
            } catch (e) {
              return new Prisma.Decimal(0);
            }
          })(),
          srcTokenAddress: it.fromTokenAddress,
          destTokenAddress: it.toTokenAddress,
        })),
      ),
    },
  };
};
