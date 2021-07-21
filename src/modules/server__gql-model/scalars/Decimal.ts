import { Prisma } from '@prisma/client';
import { Kind } from 'graphql';
import { scalarType } from 'nexus';

export const Decimal = scalarType({
  name: 'Decimal',
  asNexusMethod: 'decimal',
  description: 'A number without precision limits.',
  sourceType: { module: '@prisma/client/runtime', export: 'Decimal' },
  serialize(value: Prisma.Decimal) {
    return value.toFixed();
  },
  parseValue(value: Prisma.Decimal.Value) {
    return new Prisma.Decimal(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Prisma.Decimal(ast.value);
    }

    if (ast.kind === Kind.STRING) {
      return new Prisma.Decimal(ast.value);
    }

    return null;
  },
});
