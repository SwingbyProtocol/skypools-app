import { Global, css } from '@emotion/react';
import { rem } from 'polished';

export const size = {
  box: 4,
  drawer: 8,
  closet: 12,
  room: 14,
  house: 16,
  street: 24,
  town: 32,
  city: 40,
  state: 48,
  country: 56,
} as const;

const hslParams = (value: string) => value.replace(/(hsla?\()|(\))/gi, '');

const primaryText = hslParams('hsla(0, 0%, 100%)');

export const lightTheme = `
  --sp-color-bg-normal: ${primaryText};
  --sp-color-bg-base: ${hslParams('hsla(240, 20%, 99%)')};
  --sp-color-bg-accent: ${hslParams('hsla(0, 0%, 98%)')};

  --sp-color-text-normal: ${hslParams('hsla(217, 26%, 23%)')};
  --sp-color-text-masked: ${hslParams('hsla(215, 8%, 61%)')};
  --sp-color-text-placeholder: ${hslParams('hsla(215, 8%, 61%)')};

  --sp-color-input-bg: var(--sp-color-bg-accent);

  --sp-color-border-normal: ${hslParams('hsla(216, 8%, 88%)')};
  --sp-color-border-hover: ${hslParams('hsla(216, 8%, 70%)')};

  --sp-color-primary-normal: ${hslParams('hsla(127, 51%, 47%)')};
  --sp-color-primary-active: ${hslParams('hsla(127, 51%, 40%)')};
  --sp-color-primary-text: ${primaryText};

  --sp-color-danger-normal: ${hslParams('hsl(0, 50%, 50%)')};
  --sp-color-danger-active: ${hslParams('hsl(0, 50%, 40%)')};
  --sp-color-danger-text: ${primaryText};

  --sp-color-success-normal: ${hslParams('hsl(100, 50%, 50%)')};
  --sp-color-success-active: ${hslParams('hsl(100, 50%, 40%)')};
  --sp-color-success-text: ${primaryText};

  --sp-tooltip-border: none;
  --sp-tooltip-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);

  --sp-duration-normal: 150ms;

  --sp-app-inset-top: max(${rem(size.town)}, env(safe-area-inset-top));
  --sp-app-inset-right: max(${rem(size.town)}, env(safe-area-inset-right));
  --sp-app-inset-bottom: max(${rem(size.town)}, env(safe-area-inset-bottom));
  --sp-app-inset-left: max(${rem(size.town)}, env(safe-area-inset-left));
`;

export const darkTheme = `
  --sp-color-bg-normal: ${hslParams('hsla(217, 6%, 19%)')};
  --sp-color-bg-base: ${hslParams('hsla(217, 6%, 15%)')};
  --sp-color-bg-accent: ${hslParams('hsla(217, 6%, 26%)')};

  --sp-color-text-normal: ${hslParams('hsla(0, 0%, 100%)')};
  --sp-color-text-masked: ${hslParams('hsla(0, 0%, 98%)')};
  --sp-color-text-placeholder: ${hslParams('hsla(215, 8%, 61%)')};

  --sp-color-input-bg: var(--sp-color-bg-accent);

  --sp-color-border-normal: ${hslParams('hsla(216, 8%, 35%)')};
  --sp-color-border-hover: ${hslParams('hsla(216, 8%, 45%)')};

  --sp-tooltip-border: 1px solid hsl(var(--sp-color-border-normal));
  --sp-tooltip-shadow: none;
`;

const autoTheme = `
  ${lightTheme};

  @media (prefers-color-scheme: dark) {
    ${darkTheme};
  }
`;

export const GlobalStyles = () => (
  <Global
    styles={css`
      @import url('https://rsms.me/inter/inter.css');

      :root {
        ${autoTheme};
      }

      html {
        background: hsl(var(--sp-color-bg-base));
        color: hsl(var(--sp-color-text-normal));
        caret-color: hsla(var(--sp-color-text-normal), 75%);
        box-sizing: border-box;
        font-family: 'Inter', -apple-system, '.SFNSText-Regular', 'San Francisco',
          BlinkMacSystemFont, '.PingFang-SC-Regular', 'Microsoft YaHei', 'Segoe UI',
          'Helvetica Neue', Helvetica, Arial, sans-serif;
      }

      @supports (font-variation-settings: normal) {
        html {
          font-family: 'Inter var', -apple-system, '.SFNSText-Regular', 'San Francisco',
            BlinkMacSystemFont, '.PingFang-SC-Regular', 'Microsoft YaHei', 'Segoe UI',
            'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
      }

      body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
      }

      *,
      *::before,
      *::after {
        font-family: inherit;
        box-sizing: inherit;
        color: inherit;
      }

      .sp-svg {
        display: inline-flex;
        height: 1em;
        width: auto;
        fill: currentColor;
      }
    `}
  />
);
