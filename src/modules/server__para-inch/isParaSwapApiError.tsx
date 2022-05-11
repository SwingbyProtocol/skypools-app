import type { APIError } from 'paraswap';

export const isParaSwapApiError = (value: any): value is APIError => {
  if (value?.message === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT') {
    return false;
  }
  return typeof value === 'object' && typeof value.message === 'string';
};
