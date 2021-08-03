import { Kind } from 'graphql';
import { scalarType } from 'nexus';

export const BigIntScalar = scalarType({
  name: 'BigInt',
  description: 'A bit integer.',
  sourceType: 'BigInt',
  serialize(value: bigint) {
    return value.toString();
  },
  parseValue(value: string | number | bigint | boolean) {
    return BigInt(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return BigInt(ast.value);
    }

    if (ast.kind === Kind.STRING) {
      return BigInt(ast.value);
    }

    if (ast.kind === Kind.BOOLEAN) {
      return BigInt(ast.value);
    }

    return null;
  },
});
