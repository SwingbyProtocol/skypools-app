import { extendType, objectType, arg, inputObjectType, idArg, nonNull } from 'nexus';

import { paginate, paginatedType, paginationArgs } from './pagination';

export const Token = objectType({
  name: 'Token',
  definition(t) {
    t.model.id();
    t.model.network();
    t.model.address();
    t.model.decimals();
    t.model.logoUri();
    t.model.symbol();

    t.model.createdAt();
    t.model.updatedAt();
  },
});

const TokenWhereInput = inputObjectType({
  name: 'TokenWhereInput',
  definition(t) {
    t.list.field('AND', { type: 'TokenWhereInput' });
    t.list.field('NOT', { type: 'TokenWhereInput' });
    t.list.field('OR', { type: 'TokenWhereInput' });

    t.field('id', { type: 'StringFilter' });
    t.field('address', { type: 'StringFilter' });
    t.field('network', { type: 'NetworkEnumFilter' });
    t.field('decimals', { type: 'IntFilter' });
    t.field('logoUri', { type: 'StringFilter' });
    t.field('symbol', { type: 'StringFilter' });
    t.field('createdAt', { type: 'DateTimeFilter' });
    t.field('updatedAt', { type: 'DateTimeFilter' });
  },
});

export const TransactionQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('token', {
      type: 'Token',
      args: { id: nonNull(idArg()) },
      async resolve(source, args, ctx, info) {
        return ctx.prisma.token.findUnique({
          where: { id: args.id },
          rejectOnNotFound: true,
        });
      },
    });
  },
});

export const TokensQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('tokens', {
      type: paginatedType({ nodeType: 'Token', alias: 'Tokens' }),
      args: {
        where: arg({
          type: TokenWhereInput,
          description: 'Allows to filter results by several properties.',
        }),
        ...paginationArgs,
      },
      async resolve(source, args, ctx, info) {
        return paginate({
          ...args,
          allEdges: await ctx.prisma.token.findMany({
            where: args.where as any,
            orderBy: [{ symbol: 'asc' }, { address: 'asc' }],
          }),
        });
      },
    });
  },
});
