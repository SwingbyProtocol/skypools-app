export const useConfig = () => {
  return {
    links: {
      website: 'https://swingby.network',
      discord: 'https://discord.com/invite/q3cAjpV',
      blog: 'https://swingby.medium.com/',
      twitter: 'https://twitter.com/swingbyprotocol',
      github: 'https://github.com/swingbyprotocol',
      skybridgeInfo: 'https://skybridge.info',
      swingbyBridge: 'https://bridge.swingby.network/',
    },
    sideNavItems: [
      {
        render: 'Explorer',
        key: 'explorer',
        href: 'https://skybridge.info',
      },
      {
        render: 'Add liquidity',
        key: 'liquidity',
        href: 'https://skybridge.info/pool',
      },
      {
        render: 'Farm',
        key: 'farm',
        href: 'https://farm.swingby.network',
      },
      {
        render: 'Metanodes',
        hint: '(Validators)',
        key: 'metanodes',
        href: 'https://skybridge.info/metanodes',
      },
      {
        render: 'ERC20 Bridge',
        key: 'erc20-bridge',
        href: 'https://bridge.swingby.network',
      },
    ],
  };
};
