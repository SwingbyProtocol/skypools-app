import { parse, print } from 'graphql';
import type { Config } from 'apollo-server-micro';

import { server__graphqlEndpoint } from '../server__env';

export const playground: Config['playground'] = {
  tabs: [
    {
      name: 'All deposits',
      endpoint: server__graphqlEndpoint,
      query: print(
        parse(`
          {
            deposits(where: { network: { in: [ETHEREUM, BSC] } }) {
              totalCount
              edges {
                node {
                  hash
                  at
                  addressFrom
                  value
                  crashes {
                    reason
                  }
                  payments {
                    hash
                    status
                  }
                }
              }
            }
          }
      `),
      ),
    },
  ],
};
