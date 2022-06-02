import { AppProps } from 'next/app';
import { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import Head from 'next/head';
import { ApolloProvider } from '@apollo/client';
import { ErrorBoundary } from 'react-error-boundary';

import { languages } from '../modules/i18n';
import { Favicon } from '../components/Favicon';
import { GlobalStyles } from '../modules/styles';
import { OnboardProvider } from '../modules/onboard';
import { apolloClient } from '../modules/apollo';
import { GeneralError } from '../components/GeneralError';
import { WrongNetwork } from '../components/WrongNetwork';

// @ts-ignore
const intlOnError: React.ComponentPropsWithoutRef<typeof IntlProvider>['onError'] = (err) => {
  if (err.code === 'MISSING_TRANSLATION') {
    return;
  }

  throw err;
};

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
    <ApolloProvider client={apolloClient}>
      <IntlProvider messages={messages} locale={locale} defaultLocale="en" onError={intlOnError}>
        <ErrorBoundary fallbackRender={(props) => <GeneralError {...props} />}>
          <OnboardProvider>
            <>
              <GlobalStyles />

              <Head>
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
                />
              </Head>

              <Favicon />

              <Component {...pageProps} />
            </>
            <WrongNetwork />
          </OnboardProvider>
        </ErrorBoundary>
      </IntlProvider>
    </ApolloProvider>
  );
}

export default MyApp;
