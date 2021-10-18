export const FAKE_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const FAKE_BTC_ADDRESS = '0x0b7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7c';

export const ETHEREUM_WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
export const BSC_BTCB_ADDRESS = '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c';

export function isFakeNativeToken(value: string): boolean {
  return new RegExp(`^${FAKE_NATIVE_TOKEN_ADDRESS}$`, 'i').test(value);
}

export function isFakeBtcToken(value: string): boolean {
  return new RegExp(`^${FAKE_BTC_ADDRESS}$`, 'i').test(value);
}

export function isFakeToken(value: string): boolean {
  return isFakeBtcToken(value) || isFakeNativeToken(value);
}
