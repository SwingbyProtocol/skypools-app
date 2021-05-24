const { extendDefaultPlugins } = require('svgo');

module.exports = {
  presets: ['next/babel', '@linaria'],
  plugins: [
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
