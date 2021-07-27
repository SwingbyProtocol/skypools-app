import { extendType, objectType, arg, nonNull, list } from 'nexus';
import { ApolloError } from 'apollo-server';

const PriceHistoricItem = objectType({
  name: 'PriceHistoricItem',
  definition(t) {
    t.nonNull.field('at', { type: 'DateTime' });
    t.nonNull.field('price', { type: 'Decimal' });
  },
});

export const PriceHistoricQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('priceHistoric', {
      type: nonNull(list(nonNull(PriceHistoricItem))),
      args: {
        firstTokenId: nonNull(arg({ type: 'String', description: 'ID of the first token.' })),
        secondTokenId: arg({
          type: 'String',
          description: 'Optional ID of the second token. USD will be used if no token is provided.',
        }),
      },
      async resolve(source, args, ctx, info) {
        const firstToken = await ctx.prisma.token.findUnique({
          where: { id: args.firstTokenId },
          include: { usdPriceHistoric: true },
        });
        if (!firstToken) {
          throw new ApolloError('Did not find any token with the provided ID', 'TOKEN_NOT_FOUND', {
            firstTokenId: args.firstTokenId,
          });
        }

        const secondToken = !args.secondTokenId
          ? null
          : await ctx.prisma.token.findUnique({
              where: { id: args.secondTokenId },
              include: { usdPriceHistoric: true },
            });
        if (!secondToken) {
          return firstToken.usdPriceHistoric;
        }

        return firstToken.usdPriceHistoric
          .map((fromToken) => {
            const toToken = secondToken.usdPriceHistoric.find(
              ({ at }) => fromToken.at.toISOString() === at.toISOString(),
            );
            if (!toToken) {
              return null;
            }

            return {
              at: fromToken.at,
              price: fromToken.price.div(toToken.price),
            };
          })
          .filter((it): it is NexusGen['allTypes']['PriceHistoricItem'] => !!it);
      },
    });
  },
});
