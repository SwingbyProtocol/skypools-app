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
  ],
};
