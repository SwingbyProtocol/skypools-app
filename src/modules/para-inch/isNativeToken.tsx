export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const NATIVE_BTC_ADDRESS = '0xb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7c0';

export function isNativeToken(value: string): boolean {
  return new RegExp(`^${NATIVE_TOKEN_ADDRESS}$`, 'i').test(value);
}

export function isNativeBtcToken(value: string): boolean {
  return new RegExp(`^${NATIVE_BTC_ADDRESS}$`, 'i').test(value);
}
