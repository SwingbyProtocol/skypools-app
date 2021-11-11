import { extendType, objectType, arg, nonNull, nullable, list } from 'nexus';

import { getSwapQuote } from '../server__para-inch';

const SwapQuotePathSwapsExchangesItem = objectType({
  name: 'SwapQuotePathSwapsExchangesItem',
  definition(t) {
    t.nonNull.field('exchange', { type: 'String' });
    t.nonNull.field('fraction', { type: 'Decimal' });
    t.nonNull.field('srcTokenAmount', { type: 'Decimal' });
    t.nullable.field('destTokenAmount', { type: 'Decimal' });
  },
});

const SwapQuotePathSwapsExchanges = nonNull(list(nonNull(SwapQuotePathSwapsExchangesItem)));

const SwapQuotePathSwapsItem = objectType({
  name: 'SwapQuotePathSwapsItem',
  definition(t) {
    t.nonNull.field('exchanges', { type: SwapQuotePathSwapsExchanges });
    t.nonNull.field('srcTokenAddress', { type: 'String' });
    t.nonNull.field('destTokenAddress', { type: 'String' });
    t.nullable.field('srcToken', { type: 'Token' });
    t.nullable.field('destToken', { type: 'Token' });
  },
});

const SwapQuotePathSwaps = nonNull(list(nonNull(SwapQuotePathSwapsItem)));

const SwapQuotePathItem = objectType({
  name: 'SwapQuotePathItem',
  definition(t) {
    t.nonNull.field('fraction', { type: 'Decimal' });
    t.nonNull.field('swaps', { type: SwapQuotePathSwaps });
  },
});

const SwapQuotePath = nonNull(list(nonNull(SwapQuotePathItem)));

const SwapQuoteOtherExchange = objectType({
  name: 'SwapQuoteOtherExchange',
  definition(t) {
    t.nonNull.field('exchange', { type: 'String' });
    t.nonNull.field('destTokenAmount', { type: 'Decimal' });
    t.nonNull.field('destTokenAmountUsd', { type: 'Decimal' });
    t.nonNull.field('estimatedGas', { type: 'Decimal' });
    t.nonNull.field('estimatedGasUsd', { type: 'Decimal' });
    t.nonNull.field('fractionOfBest', { type: 'Decimal' });
  },
});

const SwapQuoteBestRoute = objectType({
  name: 'SwapQuoteBestRoute',
  definition(t) {
    t.nonNull.field('path', { type: SwapQuotePath });

    t.nonNull.field('destTokenAmount', { type: 'Decimal' });
    t.nonNull.field('destTokenAmountUsd', { type: 'Decimal' });
    t.nonNull.field('estimatedGas', { type: 'Decimal' });
    t.nonNull.field('estimatedGasUsd', { type: 'Decimal' });

    t.nonNull.field('spender', { type: 'String' });
  },
});

const SwapQuote = objectType({
  name: 'SwapQuote',
  definition(t) {
    t.nonNull.field('srcToken', { type: 'Token' });
    t.nonNull.field('destToken', { type: 'Token' });
    t.nonNull.field('nativeTokenPriceUsd', { type: 'Decimal' });
    t.nonNull.field('srcTokenPriceUsd', { type: 'Decimal' });
    t.nonNull.field('srcTokenAmount', { type: 'Decimal' });
    t.nonNull.field('srcTokenAmountUsd', { type: 'Decimal' });
    t.nonNull.field('destTokenPriceUsd', { type: 'Decimal' });
    t.nonNull.field('rawRouteData', { type: 'String' });
    t.nonNull.field('bestRoute', { type: SwapQuoteBestRoute });
    t.nonNull.list.nonNull.field('otherExchanges', { type: SwapQuoteOtherExchange });
  },
});

export const SwapQuoteQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('swapQuote', {
      type: SwapQuote,
      args: {
        initiatorAddress: nonNull(arg({ type: 'String' })),
        beneficiaryAddress: nullable(arg({ type: 'String' })),
        srcTokenAmount: nonNull(
          arg({
            type: 'Decimal',
            description:
              'In human units. For example, of swapping USDT, "1" would represent 1 USDT.',
          }),
        ),
        srcTokenAddress: nonNull(arg({ type: 'String' })),
        destTokenAddress: nonNull(arg({ type: 'String' })),
        network: nonNull(arg({ type: 'Network' })),
      },
      async resolve(source, args, ctx, info) {
        return getSwapQuote(args);
      },
    });
  },
});
