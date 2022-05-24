import { APIError } from 'paraswap';

export enum ParaSwapErrorEnum {
  ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT = 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT',
}

export const isParaSwapApiError = (value: any): value is APIError => {
  if (value?.message === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT') {
    return false;
  }
  return typeof value === 'object' && typeof value.message === 'string';
};
