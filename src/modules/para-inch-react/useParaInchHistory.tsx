import { useEffect } from 'react';

import { useOnboard } from '../onboard';
import {
  useSwapsLazyQuery,
  StringFilterMode,
  SwapsQueryResult,
} from '../../generated/skypools-graphql';

import { useParaInch } from './useParaInch';

export type ParaInchHistoryItem = NonNullable<
  SwapsQueryResult['data']
>['swaps']['edges'][number]['node'];

export const useParaInchHistory = () => {
  const { address } = useOnboard();
  const { network } = useParaInch();
  const [getSwaps, result] = useSwapsLazyQuery();

  useEffect(() => {
    if (!network || !address) return;

    getSwaps({
      variables: {
        where: {
          initiatorAddress: {
            equals: address,
            mode: StringFilterMode.Insensitive,
          },
        },
      },
    });
  }, [getSwaps, network, address]);

  return result;
};
