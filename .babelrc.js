const { extendDefaultPlugins } = require('svgo');

module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource: '@emotion/react',
        },
      },
    ],
  ],
  plugins: [
    '@emotion/babel-plugin',
    [
      'inline-react-svg',
      {
        svgo: {
          plugins: extendDefaultPlugins([
            { name: 'addClassesToSVGElement', params: { classNames: ['sp-svg'] } },
            { name: 'sortAttrs', params: true },
            { name: 'removeViewBox', params: false },
            { name: 'removeDimensions', params: true },
          ]),
        },
      },
    ],
  ],
};
