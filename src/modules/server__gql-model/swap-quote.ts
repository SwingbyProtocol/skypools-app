import { extendType, objectType, arg, nonNull, nullable, list } from 'nexus';

import { getSwapQuote } from '../server__para-inch';

const SwapQuotePathItem = objectType({
  name: 'SwapQuotePathItem',
  definition(t) {
    t.nonNull.field('exchange', { type: 'String' });
    t.nonNull.field('fraction', { type: 'Decimal' });
    t.nonNull.field('srcTokenAddress', { type: 'String' });
    t.nonNull.field('destTokenAddress', { type: 'String' });
  },
});

const SwapQuotePath = list(nonNull(list(nonNull(SwapQuotePathItem))));

const SwapQuoteOtherExchange = objectType({
  name: 'SwapQuoteOtherExchange',
  definition(t) {
    t.nonNull.field('exchange', { type: 'String' });
    t.nonNull.field('fraction', { type: 'Decimal' });
    t.nonNull.field('srcTokenAddress', { type: 'String' });
    t.nonNull.field('destTokenAddress', { type: 'String' });

    t.nonNull.field('destTokenAmount', { type: 'Decimal' });
    t.nonNull.field('destTokenAmountUsd', { type: 'Decimal' });
    t.nonNull.field('estimatedGas', { type: 'Decimal' });
    t.nonNull.field('estimatedGasUsd', { type: 'Decimal' });
    t.nonNull.field('fractionOfBest', { type: 'Decimal' });
  },
});

const TransactionData = objectType({
  name: 'TransactionData',
  definition(t) {
    t.nonNull.field('from', { type: 'String' });
    t.nonNull.field('to', { type: 'String' });
    t.nonNull.field('data', { type: 'String' });
    t.nonNull.field('value', { type: 'String' });
    t.nonNull.field('gas', { type: 'String' });
    t.nonNull.field('gasPrice', { type: 'String' });
    t.nonNull.field('chainId', { type: 'Int' });
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
    t.nonNull.field('fractionOfBest', { type: 'Decimal' });

    t.nonNull.field('spender', { type: 'String' });
    t.nonNull.field('transaction', { type: TransactionData });
  },
});

const SwapQuote = objectType({
  name: 'SwapQuote',
  definition(t) {
    t.nonNull.field('srcTokenPriceUsd', { type: 'Decimal' });
    t.nonNull.field('srcTokenAmount', { type: 'Decimal' });
    t.nonNull.field('srcTokenAmountUsd', { type: 'Decimal' });
    t.nonNull.field('destTokenPriceUsd', { type: 'Decimal' });
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
