export const logLevel =
  process.env.NEXT_PUBLIC_LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'debug' : 'trace');

export const selfUrl = process.env.NEXT_PUBLIC_SELF_URL || 'http://localhost:3000';
export const graphqlEndpoint = '/api/v1/graphql';

export const blocknativeApiKey = process.env.NEXT_PUBLIC_BLOCKNATIVE_KEY || undefined;
export const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_KEY || undefined;

export enum LOCAL_STORAGE {
  Wallet = 'wallet',
}
