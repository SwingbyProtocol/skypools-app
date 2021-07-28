import { extendType, arg, nonNull } from 'nexus';

import { getSpender } from '../server__para-inch';

export const SpenderQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('spender', {
      type: 'String',
      args: {
        network: nonNull(arg({ type: 'Network' })),
      },
      async resolve(source, args, ctx, info) {
        return await getSpender({ network: args.network });
      },
    });
  },
});
