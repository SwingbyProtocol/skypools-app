import { DateTime } from 'luxon';
import { Prisma, SwapHistoric, SwapStatus } from '@prisma/client';
import abiDecoder from 'abi-decoder';

import { Network } from '../networks';
import { logger as baseLogger } from '../logger';
import { buildWeb3Instance, scanApiFetcher } from '../server__web3';
import { shouldUseParaSwap } from '../env';

import { getSpender } from './getSpender';

type ApiResult = {
  result?: Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    to: string;
    from: string;
    value: string;
    confirmations: string;
    input: string;
    isError: string;
  }> | null;
};

const SWAP_FUNCTIONS_PARASWAP = [
  'swapOnUniswap',
  'swapOnUniswapFork',
  'simpleSwap',
  'megaSwap',
  'multiSwap',
];

const SWAP_FUNCTIONS_ONEINCH = ['swap', 'unoswap'];

const SWAP_FUNCTIONS = shouldUseParaSwap ? SWAP_FUNCTIONS_PARASWAP : SWAP_FUNCTIONS_ONEINCH;

const buildSwapId = ({ network, hash }: { network: Network; hash: string }) => {
  return Buffer.from(`${network}::${hash}`, 'utf-8').toString('base64');
};

type ShallowSwap = Omit<
  SwapHistoric,
  | 'createdAt'
  | 'updatedAt'
  | 'detailsUpdatedAt'
  | 'logsUpdatedAt'
  | 'srcAmount'
  | 'srcTokenId'
  | 'destAmount'
  | 'destTokenId'
>;

export const getShallowSwaps = async ({
  network,
  endBlockNumber,
  startBlockNumber,
  logger = baseLogger,
}: {
  network: Network;
  startBlockNumber?: number | string | null;
  endBlockNumber?: number | string | null;
  logger?: typeof baseLogger;
}) => {
  const web3 = buildWeb3Instance({ network });
  const address = (await getSpender({ network })).toLowerCase();

  logger.debug({ address, startBlockNumber, endBlockNumber }, 'Will fetch swap list');

  const response =
    (
      await scanApiFetcher<ApiResult>({
        network,
        query: {
          module: 'account',
          action: 'txlist',
          address,
          sort: 'desc',
          startblock: startBlockNumber ?? undefined,
          endblock: endBlockNumber ?? undefined,
          offset: 500,
        },
      })
    ).result ?? [];

  return response
    .filter((it) => it.to.toLowerCase() === address && new Prisma.Decimal(it.confirmations).gte(5))
    .map((it): ShallowSwap | null => {
      const hash = it.hash.toLowerCase();
      const input: { name: string } = abiDecoder.decodeMethod(it.input);
      if (!SWAP_FUNCTIONS.includes(input?.name)) {
        return null;
      }

      return {
        id: buildSwapId({ network, hash }),
        network,
        blockNumber: BigInt(it.blockNumber),
        at: DateTime.fromMillis(+it.timeStamp * 1000, { zone: 'utc' }).toJSDate(),
        hash,
        contractAddress: web3.utils.toChecksumAddress(`${it.to}`),
        initiatorAddress: web3.utils.toChecksumAddress(`${it.from}`),
        input: it.input,
        status: ((): SwapStatus => {
          try {
            return Number.parseInt(it.isError) !== 0
              ? SwapStatus.FAILED
              : new Prisma.Decimal(it.confirmations).gte(15)
              ? SwapStatus.CONFIRMED
              : SwapStatus.SENT;
          } catch (e) {
            return SwapStatus.SENT;
          }
        })(),
      };
    })
    .filter((it): it is ShallowSwap => !!it);
};
