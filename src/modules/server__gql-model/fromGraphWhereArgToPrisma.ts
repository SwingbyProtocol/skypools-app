import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import lodashMapValues from 'lodash.mapvalues';

const isObject = (value: unknown): value is object =>
  !Array.isArray(value) && typeof value === 'object';

export const fromGraphWhereArgToPrisma = <T extends unknown>(param: T, propName?: string): any => {
  if (param === null && propName === 'equals') {
    return null;
  }

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

  if (isObject(param)) {
    return lodashMapValues(param, fromGraphWhereArgToPrisma);
  }

  return param;
};
