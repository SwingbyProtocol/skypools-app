import type { TokensQueryResult } from '../../generated/skypools-graphql';

export type ParaInchToken = NonNullable<
  TokensQueryResult['data']
>['tokens']['edges'][number]['node'];
