import { ParaSwap, Token as ParaSwapToken } from 'paraswap';
import Web3 from 'web3';

import { Network, getNetworkId, getNetwork } from '../networks';
import { FAKE_BTC_ADDRESS, ParaInchToken } from '../para-inch';
import { uploadTokenLogo } from '../server__images';

import { isParaSwapApiError } from './isParaSwapApiError';

type RelevantParaSwapToken = Pick<
  ParaSwapToken,
  'address' | 'decimals' | 'img' | 'symbol' | 'network'
>;

export const getTokens = async ({ network }: { network: Network }): Promise<ParaInchToken[]> => {
  const web3 = new Web3();

  const paraSwap = new ParaSwap(getNetworkId(network));
  const tokens = await paraSwap.getTokens();
  if (isParaSwapApiError(tokens)) {
    throw new Error(`${tokens.status}: ${tokens.message}`);
  }

  const BTC_TOKEN: RelevantParaSwapToken = {
    address: FAKE_BTC_ADDRESS,
    decimals: 8,
    network: getNetworkId(network),
    img: undefined,
    symbol: 'BTC',
  };

  return (
    await Promise.all(
      [BTC_TOKEN, ...tokens].map(async (it, index): Promise<ParaInchToken> => {
        const network = getNetwork(it.network)!;
        const tokenID = buildTokenId({ network, tokenAddress: it.address });
        let logoUri = null;

        if (it.img) {
          logoUri = await uploadTokenLogo(it.img, tokenID, network);
        }
        return {
          id: tokenID,
          symbol: it.symbol ?? '',
          decimals: +it.decimals,
          address: web3.utils.toChecksumAddress(it.address),
          logoUri,
          network,
        };
      }),
    )
  ).filter((it) => !!it.symbol && !!it.address);
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
