import { AppProps } from 'next/app';
import { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import Head from 'next/head';
import { css } from '@linaria/core';

import { languages } from '../modules/i18n';
import { Favicon } from '../components/Favicon';
import { autoTheme } from '../modules/styles';

export const globalCss = css`
  :global() {
    @import url('https://rsms.me/inter/inter.css');

    :root {
      ${autoTheme};
    }

    html {
      background: hsl(var(--sp-color-bg-base));
      color: hsl(var(--sp-color-text-normal));
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, '.SFNSText-Regular', 'San Francisco', BlinkMacSystemFont,
        '.PingFang-SC-Regular', 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', Helvetica, Arial,
        sans-serif;
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
  }
`;

function MyApp({ Component, pageProps, router }: AppProps) {
  const locale = (() => {
    const result = router.locale ?? router.defaultLocale ?? 'en';
    if (Object.keys(languages).includes(result)) {
      return result as keyof typeof languages;
    }

    return 'en';
  })();

  const messages = useMemo(() => ({ ...languages.en, ...languages[locale] }), [locale]);

  return (
    <IntlProvider messages={messages} locale={locale} defaultLocale="en">
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <Favicon />

        <Component {...pageProps} />
      </>
    </IntlProvider>
  );
}

export default MyApp;
