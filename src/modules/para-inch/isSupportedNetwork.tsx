const SUPPORTED_NETWORKS = [1, 56] as const;
export type SupportedNetworkId = typeof SUPPORTED_NETWORKS[number];

export function isSupportedNetworkId(value: any): value is SupportedNetworkId {
  return SUPPORTED_NETWORKS.includes(value as any);
}
