import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import lodashMapValues from 'lodash.mapvalues';

export const fromGraphWhereArgToPrisma = <T extends unknown>(param: T): any => {
  if (typeof param === 'undefined' || param === null) {
    return undefined;
  }

  if (DateTime.isDateTime(param) || param instanceof Date) {
    return param;
  }

  if (Prisma.Decimal.isDecimal(param)) {
    return param;
  }

  if (Array.isArray(param)) {
    return param.map((it) => fromGraphWhereArgToPrisma(it));
  }

  const isObject = (value: unknown): value is object =>
    !Array.isArray(value) && typeof value === 'object';

  if (isObject(param)) {
    return lodashMapValues(param, fromGraphWhereArgToPrisma);
  }

  return param;
};
