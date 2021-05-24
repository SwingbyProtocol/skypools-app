module.exports = withLinaria({
  basePath: process.env.NEXT_CONFIG_BASE_PATH || undefined,
  i18n: {
    locales: ['en', 'es', 'ja', 'zh', 'zh-TW'],
    defaultLocale: 'en',
  },
  future: {
    webpack5: true,
  },
});

/**
 * @see https://github.com/Mistereo/next-linaria/blob/master/index.js
 * @see https://github.com/callstack/linaria/issues/724#issuecomment-775643517
 *
 * Only changed the Webpack loader that is used.
 */
function withLinaria(nextConfig = {}) {
  const LINARIA_EXTENSION = '.linaria.module.css';

  function traverse(rules) {
    for (let rule of rules) {
      if (typeof rule.loader === 'string' && rule.loader.includes('css-loader')) {
        if (
          rule.options &&
          rule.options.modules &&
          typeof rule.options.modules.getLocalIdent === 'function'
        ) {
          let nextGetLocalIdent = rule.options.modules.getLocalIdent;
          rule.options.modules.getLocalIdent = (context, _, exportName, options) => {
            if (context.resourcePath.includes(LINARIA_EXTENSION)) {
              return exportName;
            }
            return nextGetLocalIdent(context, _, exportName, options);
          };
        }
      }
      if (typeof rule.use === 'object') {
        traverse(Array.isArray(rule.use) ? rule.use : [rule.use]);
      }
      if (Array.isArray(rule.oneOf)) {
        traverse(rule.oneOf);
      }
    }
  }

  return {
    ...nextConfig,
    webpack(config, options) {
      traverse(config.module.rules);

      config.module.rules.push({
        test: /(?!_app)\.(tsx|ts|js|mjs|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('@linaria/webpack-loader'),
            options: {
              sourceMap: process.env.NODE_ENV !== 'production',
              ...(nextConfig.linaria || {}),
              extension: LINARIA_EXTENSION,
            },
          },
        ],
      });

      config.module.rules.push({
        test: /_app\.(tsx|ts|js|mjs|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('@linaria/webpack-loader'),
            options: {
              sourceMap: process.env.NODE_ENV !== 'production',
              ...(nextConfig.linaria || {}),
              extension: '.css',
            },
          },
        ],
      });
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
}
