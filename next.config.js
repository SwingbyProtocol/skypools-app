module.exports = {
  webpack5: true,
  basePath: process.env.NEXT_CONFIG_BASE_PATH || undefined,
  i18n: {
    locales: ['en', 'es', 'ja', 'zh', 'zh-TW'],
    defaultLocale: 'en',
  },
  images: {
    domains: [
      'img.paraswap.network',
      'raw.githubusercontent.com',
      'assets.coingecko.com',
      'cdn.paraswap.io',
    ],
  },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    config.module.rules = config.module.rules.map((it) => {
      if (!it.test || !it.test.source) {
        return it;
      }

      return { ...it, test: new RegExp(it.test.source.replace('|svg', ''), it.test.flags) };
    });

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            expandProps: 'end',
            template: function template(
              { template },
              opts,
              { imports, componentName, props, jsx, exports },
            ) {
              return template.ast`
                import styled from '@emotion/styled';
                ${imports}

                const SvgComponent = (${props}) => ${jsx};
                const ${componentName} = styled(SvgComponent)\`
                  box-sizing: border-box;
                  width: auto;
                  height: 1em;
                  fill: currentColor;
                  display: inline-flex;
                \`;
                ${exports}
              `;
            },
            svgoConfig: {
              plugins: [{ sortAttrs: true }, { removeViewBox: false }, { removeDimensions: true }],
            },
          },
        },
        'url-loader',
      ],
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination:
          '/swap/ethereum/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee/0x0b7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7cb7c',
        permanent: false,
      },
    ];
  },
};
