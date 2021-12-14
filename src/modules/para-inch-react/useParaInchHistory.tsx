import { useEffect } from 'react';

import { useOnboard } from '../onboard';
import {
  useSwapsLazyQuery,
  StringFilterMode,
  SwapsQueryResult,
} from '../../generated/skypools-graphql';

import { useParaInchForm } from './useParaInchForm';

export type ParaInchHistoryItem = NonNullable<
  SwapsQueryResult['data']
>['swaps']['edges'][number]['node'];

export const useParaInchHistory = () => {
  const { address } = useOnboard();
  const { network } = useParaInchForm();
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

  useEffect(() => {
    if (!address || !result || !result.startPolling) return;
    result.startPolling(30000);
  }, [address, result]);

  return result;
};
