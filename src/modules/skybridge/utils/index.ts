import { SkybridgeBridge, SkybridgeMode } from '@swingby-protocol/sdk';

export const getWidgetUrl = ({
  bridge,
  mode,
  hash,
  disableNavigation,
}: {
  bridge: SkybridgeBridge;
  mode: SkybridgeMode;
  hash: string;
  disableNavigation: boolean;
}) => {
  return `https://widget.skybridge.exchange/${mode}/swap/${hash}?bridge=${bridge}&&disableNavigation=${disableNavigation}`;
};
