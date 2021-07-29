import { extendType, objectType, arg, inputObjectType, idArg, nonNull } from 'nexus';

import { paginate, paginatedType, paginationArgs } from './pagination';

export const Swap = objectType({
  name: 'Swap',
  definition(t) {
    t.model('SwapHistoric').id();
    t.model('SwapHistoric').network();
    t.model('SwapHistoric').hash();
    t.model('SwapHistoric').at();
    t.model('SwapHistoric').status();
    t.model('SwapHistoric').blockNumber();
    t.model('SwapHistoric').contractAddress();
    t.model('SwapHistoric').initiatorAddress();

    t.model('SwapHistoric').srcToken();
    t.model('SwapHistoric').srcAmount();
    t.model('SwapHistoric').destToken();
    t.model('SwapHistoric').destAmount();

    t.model('SwapHistoric').createdAt();
    t.model('SwapHistoric').updatedAt();
  },
});

const SwapWhereInput = inputObjectType({
  name: 'SwapWhereInput',
  definition(t) {
    t.list.field('AND', { type: 'SwapWhereInput' });
    t.list.field('NOT', { type: 'SwapWhereInput' });
    t.list.field('OR', { type: 'SwapWhereInput' });

    t.field('id', { type: 'StringFilter' });
    t.field('network', { type: 'NetworkEnumFilter' });
    t.field('hash', { type: 'StringFilter' });
    t.field('at', { type: 'DateTimeFilter' });
    t.field('status', { type: 'SwapStatusEnumFilter' });
    t.field('blockNumber', { type: 'BigIntFilter' });
    t.field('contractAddress', { type: 'StringFilter' });
    t.field('initiatorAddress', { type: 'StringFilter' });

    t.field('srcAmount', { type: 'DecimalFilter' });
    t.field('srcToken', { type: 'TokenWhereInput' });
    t.field('destAmount', { type: 'DecimalFilter' });
    t.field('destToken', { type: 'TokenWhereInput' });

    t.field('createdAt', { type: 'DateTimeFilter' });
    t.field('updatedAt', { type: 'DateTimeFilter' });
  },
});

export const SwapQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('swap', {
      type: 'Swap',
      args: { id: nonNull(idArg()) },
      async resolve(source, args, ctx, info) {
        return ctx.prisma.swapHistoric.findUnique({
          where: { id: args.id },
          rejectOnNotFound: true,
        });
      },
    });
  },
});

export const SwapsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('swaps', {
      type: paginatedType({ nodeType: 'Swap', alias: 'Swaps' }),
      args: {
        where: arg({
          type: SwapWhereInput,
          description: 'Allows to filter results by several properties.',
        }),
        ...paginationArgs,
      },
      async resolve(source, args, ctx, info) {
        return paginate({
          ...args,
          allEdges: await ctx.prisma.swapHistoric.findMany({
            where: args.where as any,
            orderBy: [{ at: 'desc' }, { blockNumber: 'desc' }, { hash: 'asc' }],
          }),
        });
      },
    });
  },
});
