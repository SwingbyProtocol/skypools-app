module.exports = {
  basePath: process.env.NEXT_CONFIG_BASE_PATH || undefined,
  i18n: {
    locales: ['en', 'es', 'ja', 'zh', 'zh-TW'],
    defaultLocale: 'en',
  },
  future: {
    webpack5: true,
  },
  images: {
    domains: ['img.paraswap.network', 'raw.githubusercontent.com', 'tokens.1inch.exchange'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination:
          '/swap/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/0xdac17f958d2ee523a2206206994597c13d831ec7',
        permanent: false,
      },
    ];
  },
};
