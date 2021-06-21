export function isNativeToken(value: string): boolean {
  return /^0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee$/i.test(value);
}
