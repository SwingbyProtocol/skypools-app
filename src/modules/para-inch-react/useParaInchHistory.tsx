import { useEffect } from 'react';

import {
  useSwapsLazyQuery,
  StringFilterMode,
  SwapsQueryResult,
} from '../../generated/skypools-graphql';
import { useWalletConnection } from '../hooks/useWalletConnection';

import { useParaInchForm } from './useParaInchForm';

export type ParaInchHistoryItem = NonNullable<
  SwapsQueryResult['data']
>['swaps']['edges'][number]['node'];

export const useParaInchHistory = () => {
  const { address } = useWalletConnection();
  const { network } = useParaInchForm();
  const [getSwaps, result] = useSwapsLazyQuery();

  useEffect(() => {
    if (!network || !address) return;

    getSwaps({
      variables: {
        last: 25,
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
    if (!result.data) return;
    result.startPolling(30000);
    return () => result.stopPolling();
  }, [result]);

  return result;
};
