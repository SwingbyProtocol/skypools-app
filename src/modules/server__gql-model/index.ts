import path from 'path';

import { makeSchema } from 'nexus';
import { nexusPrisma } from 'nexus-plugin-prisma';

import * as scalars from './scalars';
import * as filters from './filters';
import * as tokens from './tokens';
import * as priceHistoric from './price-historic';

export const schema = makeSchema({
  types: {
    ...scalars,
    ...filters,
    ...tokens,
    ...priceHistoric,
  },
  plugins: [nexusPrisma()],
  contextType: {
    module: path.join(__dirname, 'context.ts'),
    export: 'MyContextType',
  },
  outputs: {
    typegen: path.join(__dirname, '..', '..', '..', 'nexus-typegen.d.ts'),
    schema: path.join(__dirname, '..', '..', '..', 'schema.graphql'),
  },
  prettierConfig: path.join(__dirname, '..', '..', '..', 'prettier.config.js'),
});

export default schema;
