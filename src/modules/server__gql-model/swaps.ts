import { extendType, objectType, arg, inputObjectType, idArg, nonNull, nullable } from 'nexus';
import { ApolloError } from 'apollo-server';
import type { OptimalRate } from 'paraswap-core';
import { Prisma } from '@prisma/client';

import { isFakeBtcToken } from '../para-inch';

import { buildCursor, decodeCursor, paginatedType, paginationArgs } from './pagination';

export const Swap = objectType({
  name: 'Swap',
  definition(t) {
    t.nonNull.id('id');
    t.model.network();
    t.model.status();

    t.model.initiatorAddress();
    t.model.beneficiaryAddress();

    t.nonNull.field('srcToken', { type: 'Token' });
    t.model.srcAmount();
    t.nonNull.field('destToken', { type: 'Token' });
    t.model.destAmount();

    t.model.rawRouteData();

    t.model.skybridgeSwapId();
    t.model.skypoolsTransactionHashes();

    t.model.createdAt();
    t.model.updatedAt();
  },
});

const SwapWhereInput = inputObjectType({
  name: 'SwapWhereInput',
  definition(t) {
    t.list.field('AND', { type: 'SwapWhereInput' });
    t.field('NOT', { type: 'SwapWhereInput' });
    t.list.field('OR', { type: 'SwapWhereInput' });

    t.field('id', { type: 'IdFilter' });
    t.field('network', { type: 'NetworkEnumFilter' });

    t.field('initiatorAddress', { type: 'StringFilter' });
    t.field('beneficiaryAddress', { type: 'StringFilter' });

    t.field('srcToken', { type: 'TokenWhereInput' });
    t.field('srcAmount', { type: 'DecimalFilter' });
    t.field('destToken', { type: 'TokenWhereInput' });
    t.field('destAmount', { type: 'DecimalFilter' });

    t.field('skybridgeSwapId', { type: 'StringFilter' });
    t.field('skypoolsTransactionHashes', { type: 'StringArrayFilter' });

    t.field('createdAt', { type: 'DateTimeFilter' });
    t.field('updatedAt', { type: 'DateTimeFilter' });
  },
});

export const SwapQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('swap', {
      type: Swap,
      args: { id: nonNull(idArg()) },
      async resolve(source, args, ctx, info) {
        return ctx.prisma.swap.findUnique({
          where: { id: args.id },
          rejectOnNotFound: true,
          include: { srcToken: true, destToken: true },
        });
      },
    });
  },
});

export const CreateSwapMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createSwap', {
      type: Swap,
      args: {
        network: nonNull('Network'),
        beneficiaryAddress: nonNull('String'),
        initiatorAddress: nonNull('String'),
        rawRouteData: nonNull('String'),
        srcAmount: nonNull('Decimal'),
        destTokenId: nonNull('ID'),
        srcTokenId: nonNull('ID'),
        skypoolsTransactionHash: nullable('String'),
        skybridgeSwapId: nullable('String'),
      },
      async resolve(source, args, ctx, info) {
        const srcToken = await ctx.prisma.token.findUnique({ where: { id: args.srcTokenId } });
        if (!srcToken) {
          throw new ApolloError('Invalid "srcTokenId"', 'INVALID_TOKEN_ID', {
            srcTokenId: args.srcTokenId,
          });
        }

        const destToken = await ctx.prisma.token.findUnique({ where: { id: args.destTokenId } });
        if (!destToken) {
          throw new ApolloError('Invalid "destTokenId"', 'INVALID_TOKEN_ID', {
            destTokenId: args.destTokenId,
          });
        }

        if (srcToken.network !== args.network) {
          throw new ApolloError(
            '"network" does not match "srcToken"\'s network',
            'INVALID_TOKEN_NETWORK',
          );
        }

        if (destToken.network !== args.network) {
          throw new ApolloError(
            '"network" does not match "destToken"\'s network',
            'INVALID_TOKEN_NETWORK',
          );
        }

        if (srcToken.id === destToken.id) {
          throw new ApolloError(
            '"srcToken" and "destToken" cannot be the same token',
            'MATCHING_SRC_AND_DEST_TOKENS',
          );
        }

        if (isFakeBtcToken(srcToken.address) && !args.skybridgeSwapId) {
          throw new ApolloError(
            '"skybridgeSwapId" must be provided for this type of swap',
            'MISSING_SKYBRIDGE_SWAP_ID',
          );
        }

        if (!isFakeBtcToken(srcToken.address) && !args.skypoolsTransactionHash) {
          throw new ApolloError(
            '"skypoolsTransactionHash" must be provided for this type of swap',
            'MISSING_SKYPOOLS_TRANSACTION_HASH',
          );
        }

        const id = Buffer.from(
          `${args.network}::${args.skybridgeSwapId ?? args.skypoolsTransactionHash}`,
          'utf-8',
        ).toString('base64');

        const paraSwapData = JSON.parse(args.rawRouteData) as OptimalRate;

        return ctx.prisma.swap.create({
          include: { srcToken: true, destToken: true },
          data: {
            id,
            network: args.network,
            beneficiaryAddress: args.beneficiaryAddress,
            initiatorAddress: args.initiatorAddress,
            rawRouteData: args.rawRouteData,
            srcAmount: args.srcAmount,
            destAmount: new Prisma.Decimal(paraSwapData.destAmount).div(
              `1e${paraSwapData.destDecimals}`,
            ),
            destTokenId: args.destTokenId,
            srcTokenId: args.srcTokenId,
            skybridgeSwapId: args.skybridgeSwapId ?? null,
            skypoolsTransactionHashes: args.skypoolsTransactionHash
              ? [args.skypoolsTransactionHash]
              : [],
          },
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
        type Where = NonNullable<Parameters<typeof ctx.prisma.swap.findMany>['0']>['where'];
        type OrderBy = NonNullable<Parameters<typeof ctx.prisma.swap.findMany>['0']>['orderBy'];

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
          : await ctx.prisma.swap.findUnique({ where: { id: decodeCursor(args.after) } });
        const before = !args.before
          ? null
          : await ctx.prisma.swap.findUnique({ where: { id: decodeCursor(args.before) } });

        const where: Where =
          !before && !after
            ? (args.where as any)
            : {
                AND: [
                  {
                    createdAt: {
                      [before ? 'lt' : 'gt']: before ? before.createdAt : after?.createdAt,
                    },
                  },
                  args.where,
                ],
              };

        const orderBy: OrderBy =
          type === 'after' ? [{ createdAt: 'asc' }] : [{ createdAt: 'desc' }];

        const edges = (
          await ctx.prisma.swap.findMany({
            where,
            orderBy,
            take,
            include: { destToken: true, srcToken: true },
          })
        ).map((it) => ({ node: it, cursor: buildCursor(it.id) }));

        if (type === 'before') {
          edges.reverse();
        }

        return {
          totalCount: (await ctx.prisma.swap.aggregate({ where: args.where as any, _count: true }))
            ._count,
          edges,
          pageInfo: {
            startCursor: edges[0]?.cursor || '',
            endCursor: edges[edges.length - 1]?.cursor || '',
            hasPreviousPage:
              edges.length > 0 &&
              !!(await ctx.prisma.swap.findFirst({
                where: { AND: [{ createdAt: { lt: edges[0].node.createdAt } }] },
              })),
            hasNextPage:
              edges.length > 0 &&
              !!(await ctx.prisma.swap.findFirst({
                where: { AND: [{ createdAt: { gt: edges[edges.length - 1].node.createdAt } }] },
              })),
          },
        };
      },
    });
  },
});
