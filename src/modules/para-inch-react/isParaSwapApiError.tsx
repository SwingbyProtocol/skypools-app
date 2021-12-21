import type { APIError } from 'paraswap';

export const isParaSwapApiError = (value: any): value is APIError => {
  return typeof value === 'object' && typeof value.message === 'string';
};
