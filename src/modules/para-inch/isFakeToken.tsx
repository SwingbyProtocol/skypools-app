import { Network } from '../networks';

export const FAKE_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const FAKE_BTC_ADDRESS = '0x0b7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7c';

export function isFakeNativeToken(value: string): boolean {
  return new RegExp(`^${FAKE_NATIVE_TOKEN_ADDRESS}$`, 'i').test(value);
}

export function isFakeBtcToken(value: string): boolean {
  return new RegExp(`^${FAKE_BTC_ADDRESS}$`, 'i').test(value);
}

export function isFakeToken(value: string): boolean {
  return isFakeBtcToken(value) || isFakeNativeToken(value);
}

export function getWrappedBtcAddress({ network }: { network: Network }) {
  switch (network) {
    case Network.ETHEREUM:
      return '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
    case Network.ROPSTEN:
      return '0x7cb2eac36b4bb7c36640f32e806d33e474d1d427';
    case Network.BSC:
      return '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c';
  }
}

export function getERC20Address({
  network,
  tokenAddress,
}: {
  network: Network;
  tokenAddress: string;
}): string {
  if (isFakeNativeToken(tokenAddress)) {
    switch (network) {
      case Network.ETHEREUM:
        return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
      case Network.ROPSTEN:
        return '0xc778417E063141139Fce010982780140Aa0cD5Ab';
      case Network.BSC:
        return '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    }
  }
  return tokenAddress;
}

export function getERC20Symbol(symbol: string): string {
  if (symbol === 'ETH') return 'WETH';
  if (symbol === 'BNB') return 'WBNB';
  return symbol;
}
