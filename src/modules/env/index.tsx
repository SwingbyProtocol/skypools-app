export const logLevel =
  process.env.NEXT_PUBLIC_LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'debug' : 'trace');

export const selfUrl = process.env.NEXT_PUBLIC_SELF_URL || 'http://localhost:3000';
export const graphqlEndpoint = '/api/v1/graphql';

export const blocknativeApiKey = process.env.NEXT_PUBLIC_BLOCKNATIVE_KEY || undefined;
export const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_KEY || undefined;
export const minimumReceiveBtcAmount = 0.001;

export const availableNetwork = ['ROPSTEN'];

export enum LOCAL_STORAGE {
  btcPendingDeposits = 'btc-pending-deposits',
  Wallet = 'wallet',
  Terms = 'swingby-skypools.terms',
}
export const IGNORED_STORE_WALLET_NAMES = ['WalletConnect'];
