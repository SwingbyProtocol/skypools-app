import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities'; // eslint-disable-line import/no-internal-modules
import { RetryLink } from '@apollo/client/link/retry'; // eslint-disable-line import/no-internal-modules

import { graphqlEndpoint, selfUrl } from '../env';

export const apolloClient = new ApolloClient({
  link: new RetryLink().split(
    (operation) => operation.getContext().serviceName === 'skybridge',
    new HttpLink({ uri: 'https://network.skybridge.exchange/api/v3/graphql' }),
    new HttpLink({ uri: `${selfUrl}${graphqlEndpoint}` }),
  ),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          transactions: relayStylePagination(['where']),
        },
      },
    },
  }),
});
