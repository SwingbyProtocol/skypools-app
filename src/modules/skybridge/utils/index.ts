import { Network } from '@prisma/client';
import {
  buildContext,
  SkybridgeBridge,
  SkybridgeMode,
  SkybridgeQuery,
} from '@swingby-protocol/sdk';

import { logger } from '../../logger';

import { fetcher } from './../../fetch';

export const getWidgetUrl = ({
  bridge,
  mode,
  hash,
  disableNavigation,
}: {
  bridge: SkybridgeBridge;
  mode: SkybridgeMode;
  hash: string;
  disableNavigation: boolean;
}): string => {
  return `https://widget.skybridge.exchange/${mode}/swap/${hash}?bridge=${bridge}&&disableNavigation=${disableNavigation}`;
};

export const getSkybridgeTx = async ({
  network,
  hash,
}: {
  network: Network;
  hash: string;
}): Promise<SkybridgeQuery | null> => {
  try {
    const context = await buildContext({
      mode: network === 'ROPSTEN' ? 'test' : 'production',
    });
    const bridge = network === 'BSC' ? 'btc_bep20' : 'btc_erc';
    const baseEndpoint = `${context.servers.swapNode[bridge]}/api/v1`;
    const url = `${baseEndpoint}/swaps/query?hash=${hash}`;
    const result = await fetcher<{ items: SkybridgeQuery[] }>(url);
    return result.items[0] ?? null;
  } catch (err) {
    logger.error({ err }, 'could not fetch data from nodes');
    return null;
  }
};
