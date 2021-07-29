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
          AND: [
            {
              initiatorAddress: {
                equals: address,
                mode: StringFilterMode.Insensitive,
              },
            },
            {
              NOT: {
                OR: [
                  { srcToken: null },
                  { destToken: null },
                  { destAmount: null },
                  { srcAmount: null },
                ],
              },
            },
          ],
        },
      },
    });
  }, [getSwaps, network, address]);

  return result;
};
