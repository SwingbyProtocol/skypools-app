import { parse, print } from 'graphql';
import type { Config } from 'apollo-server-micro';

import { graphqlEndpoint, selfUrl } from '../env';

const endpoint = `${selfUrl}${graphqlEndpoint}`;

export const playground: Config['playground'] = {
  endpoint,
  tabs: [
    {
      name: 'Ethereum tokens',
      endpoint,
      query: print(
        parse(`
          {
            tokens(where: { network: { equals: ETHEREUM } }) {
              totalCount
              edges {
                node {
                  address
                  symbol
                  decimals
                }
              }
            }
          }
        `),
      ),
    },
    {
      name: 'ETH/WBTC price',
      endpoint,
      query: print(
        parse(`
          {
            priceHistoric(
              firstTokenId: "RVRIRVJFVU06OjB4RWVlZWVFZWVlRWVFZWVFZUVlRWVlRUVFZWVlZUVlZWVlZWVlRUVlRQ=="
              secondTokenId: "RVRIRVJFVU06OjB4MjI2MGZhYzVlNTU0MmE3NzNhYTQ0ZmJjZmVkZjdjMTkzYmMyYzU5OQ=="
            ) {
              at
              price
            }
          }
        `),
      ),
    },
    {
      name: 'Swap history',
      endpoint,
      query: print(
        parse(`
          {
            swaps(
              where: {
                AND: [
                  {
                    initiatorAddress: {
                      equals: "0xb680c8F33f058163185AB6121F7582BAb57Ef8a7"
                      mode: insensitive
                    }
                  }
                  {
                    NOT: {
                      OR: [
                        { srcToken: null }
                        { destToken: null }
                        { destAmount: null }
                        { srcAmount: null }
                      ]
                    }
                  }
                ]
              }
            ) {
              totalCount
              edges {
                node {
                  hash
                  at
                  srcToken {
                    symbol
                  }
                  srcAmount
                  destToken {
                    symbol
                  }
                  destAmount
                }
              }
            }
          }
       `),
      ),
    },
  ],
};
