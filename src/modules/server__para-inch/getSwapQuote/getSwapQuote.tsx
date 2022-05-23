import { Prisma, Token } from '@prisma/client';
import Web3 from 'web3';
import { ApolloError } from 'apollo-server';

import { Network } from '../../networks';
import prisma from '../../server__env';
import { getWrappedBtcAddress, isFakeBtcToken } from '../../para-inch';

import type { GetSwapQuoteParams, SwapQuote } from './types';
import { getParaSwapQuote } from './getParaSwapQuote';

const getParaSwapToken = async ({
  network,
  token,
}: {
  network: Network;
  token: Token;
}): Promise<Token> => {
  if (!isFakeBtcToken(token.address)) {
    return token;
  }

  const address = getWrappedBtcAddress(network);
  const web3 = new Web3();
  const result = await prisma?.token.findUnique({
    where: {
      network_address: {
        network,
        address: web3.utils.toChecksumAddress(address),
      },
    },
  });
  if (!result) {
    throw new Error(`Could not find token "${address}" on network ${network}`);
  }

  return result;
};

export const getSwapQuote = async ({
  beneficiaryAddress,
  destTokenAddress,
  initiatorAddress,
  network,
  srcTokenAddress,
  srcTokenAmount: srcTokenAmountParam,
}: GetSwapQuoteParams): Promise<SwapQuote> => {
  const { srcToken, destToken } = await (async () => {
    const web3 = new Web3();
    const srcToken = await prisma?.token.findUnique({
      where: {
        network_address: { network, address: web3.utils.toChecksumAddress(srcTokenAddress) },
      },
    });
    if (!srcToken) {
      throw new Error(`Could not find token "${srcTokenAddress}" on network ${network}`);
    }

    const destToken = await prisma?.token.findUnique({
      where: {
        network_address: { network, address: web3.utils.toChecksumAddress(destTokenAddress) },
      },
    });
    if (!destToken) {
      throw new Error(`Could not find token "${destTokenAddress}" on network ${network}`);
    }

    return { srcToken, destToken };
  })();

  const paraSwapSrcToken = await getParaSwapToken({ network, token: srcToken });
  const paraSwapDestToken = await getParaSwapToken({ network, token: destToken });

  const paraSwapQuote = await getParaSwapQuote({
    network,
    destTokenAddress: paraSwapDestToken.address,
    srcTokenAmount: srcTokenAmountParam,
    initiatorAddress,
    srcTokenAddress: paraSwapSrcToken.address,
    beneficiaryAddress,
  });

  const initialSkybridgeSwap:
    | typeof paraSwapQuote['bestRoute']['path'][number]['swaps'][number]
    | null =
    paraSwapSrcToken === srcToken
      ? null
      : {
          srcTokenAddress,
          srcToken,
          destToken: paraSwapSrcToken,
          destTokenAddress: paraSwapSrcToken.address,
          exchanges: [
            {
              exchange: 'skybridge',
              fraction: new Prisma.Decimal(1),
              srcTokenAmount: paraSwapQuote.srcTokenAmount,
              destTokenAmount: paraSwapQuote.srcTokenAmount,
            },
          ],
        };

  const finalSkybridgeSwap:
    | typeof paraSwapQuote['bestRoute']['path'][number]['swaps'][number]
    | null =
    paraSwapDestToken === destToken
      ? null
      : {
          srcTokenAddress: paraSwapDestToken.address,
          srcToken: paraSwapDestToken,
          destToken,
          destTokenAddress,
          exchanges: [
            {
              exchange: 'skybridge',
              fraction: new Prisma.Decimal(1),
              srcTokenAmount: paraSwapQuote.bestRoute.destTokenAmount,
              destTokenAmount: paraSwapQuote.bestRoute.destTokenAmount,
            },
          ],
        };

  if (initialSkybridgeSwap && finalSkybridgeSwap) {
    throw new ApolloError(
      'Swap requires Skybridge both as the initial and final steps',
      'SWAP_REQUIRES_SKYBRIDGE_TWICE',
      { initialSkybridgeSwap, finalSkybridgeSwap },
    );
  }

  return {
    ...paraSwapQuote,
    srcToken,
    destToken,
    rawRouteData: paraSwapQuote.rawRouteData,
    bestRoute: {
      ...paraSwapQuote.bestRoute,
      path: paraSwapQuote.bestRoute.path.map((it) => {
        return {
          ...it,
          swaps: [
            ...(!initialSkybridgeSwap ? [] : [initialSkybridgeSwap]),
            ...it.swaps,
            ...(!finalSkybridgeSwap ? [] : [finalSkybridgeSwap]),
          ],
        };
      }),
    },
  };
};
