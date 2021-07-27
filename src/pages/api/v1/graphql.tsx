import { ApolloServer } from 'apollo-server-micro';
import { NextApiRequest, NextApiResponse } from 'next';

import { corsMiddleware } from '../../../modules/server__cors';
import { prisma } from '../../../modules/server__env';
import { graphqlEndpoint } from '../../../modules/env';
import { schema } from '../../../modules/server__gql-model';
import { playground } from '../../../modules/server__gql-playground';

const server = new ApolloServer({
  schema,
  playground,
  introspection: true,
  context: {
    prisma,
  },
});

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
