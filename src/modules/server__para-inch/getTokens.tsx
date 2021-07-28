import { ParaSwap } from 'paraswap';
import Web3 from 'web3';

import { shouldUseParaSwap } from '../env';
import { fetcher } from '../fetch';
import { Network, getNetworkId, getNetwork } from '../networks';
import { ParaInchToken } from '../para-inch';

import { ENDPOINT_1INCH_API } from './constants';
import { isParaSwapApiError } from './isParaSwapApiError';

export const getTokens = async ({ network }: { network: Network }): Promise<ParaInchToken[]> => {
  const web3 = new Web3();

  if (shouldUseParaSwap) {
    const paraSwap = new ParaSwap(getNetworkId(network));
    const tokens = await paraSwap.getTokens();
    if (isParaSwapApiError(tokens)) {
      throw new Error(`${tokens.status}: ${tokens.message}`);
    }

    return (
      await Promise.all(
        tokens.map(async (it): Promise<ParaInchToken> => {
          const network = getNetwork(it.network)!;
          return {
            id: buildTokenId({ network, tokenAddress: it.address }),
            symbol: it.symbol ?? '',
            decimals: +it.decimals,
            address: web3.utils.toChecksumAddress(it.address),
            logoUri: (it.img === 'https://img.paraswap.network/token.png' ? null : it.img) || null,
            network,
          };
        }),
      )
    ).filter((it) => !!it.symbol && !!it.address);
  }

  const result = await fetcher<{
    tokens: Record<
      string,
      { symbol: string; name: string; decimals: number; address: string; logoURI: string }
    >;
  }>(`${ENDPOINT_1INCH_API}/${network}/tokens`);

  return await Promise.all(
    Object.values(result.tokens).map(async (it): Promise<ParaInchToken> => {
      return {
        id: buildTokenId({ network, tokenAddress: it.address }),
        symbol: it.symbol,
        decimals: +it.decimals,
        address: web3.utils.toChecksumAddress(it.address),
        logoUri: it.logoURI || null,
        network,
      };
    }),
  );
};

export const buildTokenId = ({
  network,
  tokenAddress,
}: {
  network: Network;
  tokenAddress: string;
}) => {
  const web3 = new Web3();
  return Buffer.from(`${network}::${web3.utils.toChecksumAddress(tokenAddress)}`, 'utf-8').toString(
    'base64',
  );
};
