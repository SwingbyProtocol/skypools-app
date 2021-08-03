import { extendType, objectType, arg, inputObjectType, idArg, nonNull } from 'nexus';

import { buildCursor, decodeCursor, paginatedType, paginationArgs } from './pagination';

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
    t.field('NOT', { type: 'SwapWhereInput' });
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
        type Where = NonNullable<Parameters<typeof ctx.prisma.swapHistoric.findMany>['0']>['where'];
        type OrderBy = NonNullable<
          Parameters<typeof ctx.prisma.swapHistoric.findMany>['0']
        >['orderBy'];

        const type =
          typeof args.last === 'number' || typeof args.before === 'string' ? 'before' : 'after';

        if (
          (type === 'before' &&
            (typeof args.after === 'string' || typeof args.first === 'number')) ||
          (type === 'after' && (typeof args.before === 'string' || typeof args.last === 'number'))
        ) {
          throw new Error('You may combine only "first" and "after", or "last" and "before".');
        }

        const take = args.last ?? args.first ?? 25;
        if (1 > take || take > 1000) {
          throw new Error('"first" or "last" must be between 1 and 1000');
        }

        const after = !args.after
          ? null
          : await ctx.prisma.swapHistoric.findUnique({ where: { id: decodeCursor(args.after) } });
        const before = !args.before
          ? null
          : await ctx.prisma.swapHistoric.findUnique({ where: { id: decodeCursor(args.before) } });

        const where: Where =
          !before && !after
            ? (args.where as any)
            : {
                AND: [
                  { at: { [before ? 'lt' : 'gt']: before ? before.at : after?.at } },
                  args.where,
                ],
              };

        const orderBy: OrderBy =
          type === 'after'
            ? [{ at: 'asc' }, { blockNumber: 'asc' }, { hash: 'desc' }]
            : [{ at: 'desc' }, { blockNumber: 'desc' }, { hash: 'asc' }];

        const edges = (
          await ctx.prisma.swapHistoric.findMany({
            where,
            orderBy,
            take,
          })
        ).map((it) => ({ node: it, cursor: buildCursor(it.id) }));

        if (type === 'before') {
          edges.reverse();
        }

        return {
          totalCount: (
            await ctx.prisma.swapHistoric.aggregate({ where: args.where as any, _count: true })
          )._count,
          edges,
          pageInfo: {
            startCursor: edges[0]?.cursor || '',
            endCursor: edges[edges.length - 1]?.cursor || '',
            hasPreviousPage:
              edges.length > 0 &&
              !!(await ctx.prisma.swapHistoric.findFirst({
                where: { AND: [{ at: { lt: edges[0].node.at } }] },
              })),
            hasNextPage:
              edges.length > 0 &&
              !!(await ctx.prisma.swapHistoric.findFirst({
                where: { AND: [{ at: { gt: edges[edges.length - 1].node.at } }] },
              })),
          },
        };
      },
    });
  },
});
