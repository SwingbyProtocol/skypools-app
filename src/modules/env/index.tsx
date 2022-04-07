export const logLevel =
  process.env.NEXT_PUBLIC_LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'debug' : 'trace');

export const selfUrl = process.env.NEXT_PUBLIC_SELF_URL || 'http://localhost:3000';
export const graphqlEndpoint = '/api/v1/graphql';

export const blocknativeApiKey = process.env.NEXT_PUBLIC_BLOCKNATIVE_KEY || undefined;
export const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_KEY || undefined;
export const minimumReceiveBtcAmount = 0.001;

export const availableNetwork = ['ETHEREUM', 'ROPSTEN'];

export const isProduction: boolean = process.env.NEXT_PUBLIC_MODE === 'production';

export enum LOCAL_STORAGE {
  btcPendingDeposits = 'btc-pending-deposits',
  Wallet = 'wallet',
  Terms = 'swingby-skypools.terms',
}
export const IGNORED_STORE_WALLET_NAMES = ['WalletConnect'];

export const RPC_URLS: Record<number, string> = {
  1: `https://mainnet.infura.io/v3/${infuraApiKey}`,
  3: `https://ropsten.infura.io/v3/${infuraApiKey}`,
  5: `https://goerli.infura.io/v3/${infuraApiKey}`,
  56: 'https://bsc-dataseed1.binance.org:443',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  137: 'https://rpc-mainnet.matic.network',
  80001: 'https://rpc-mumbai.matic.today',
} as const;
