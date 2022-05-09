import { ApolloServer } from 'apollo-server-micro';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

import { corsMiddleware } from '../../../modules/server__cors';
import prisma from '../../../modules/server__env';
import { graphqlEndpoint } from '../../../modules/env';
import { schema } from '../../../modules/server__gql-model';

const server = new ApolloServer({
  schema,
  introspection: true,
  context: {
    prisma,
  },
  plugins: [ApolloServerPluginLandingPageLocalDefault({ footer: false })],
});

await server.start();
const handler = server.createHandler({ path: graphqlEndpoint });

export default async function (req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware({ req, res });
  return handler(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
