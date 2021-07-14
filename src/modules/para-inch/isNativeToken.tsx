export const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export function isNativeToken(value: string): boolean {
  return new RegExp(`^${NATIVE_TOKEN_ADDRESS}$`, 'i').test(value);
}
