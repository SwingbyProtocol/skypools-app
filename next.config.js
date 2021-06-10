module.exports = {
  basePath: process.env.NEXT_CONFIG_BASE_PATH || undefined,
  i18n: {
    locales: ['en', 'es', 'ja', 'zh', 'zh-TW'],
    defaultLocale: 'en',
  },
  future: {
    webpack5: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/swap/BTC/WBTC',
        permanent: false,
      },
    ];
  },
};
