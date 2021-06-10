import { AppProps } from 'next/app';
import { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import Head from 'next/head';

import { languages } from '../modules/i18n';
import { Favicon } from '../components/Favicon';
import { GlobalStyles } from '../modules/styles';

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
        <GlobalStyles />

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
