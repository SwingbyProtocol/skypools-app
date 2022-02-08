import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities'; // eslint-disable-line import/no-internal-modules

import { graphqlEndpoint, selfUrl } from '../env';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: `${selfUrl}${graphqlEndpoint}` }),
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
