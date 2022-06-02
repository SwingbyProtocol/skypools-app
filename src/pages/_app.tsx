import { AppProps } from 'next/app';
import React, { ReactElement, ReactNode, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import Head from 'next/head';
import { ApolloProvider } from '@apollo/client';
import { ErrorBoundary } from 'react-error-boundary';
import { PulsarGlobalStyles, PulsarThemeProvider } from '@swingby-protocol/pulsar';
import { NextPage } from 'next';

import { languages } from '../modules/i18n';
import { Favicon } from '../components/Favicon';
import { GlobalStyles } from '../modules/styles';
import { OnboardProvider } from '../modules/onboard';
import { apolloClient } from '../modules/apollo';
import { GeneralError } from '../components/GeneralError';
import { WrongNetwork } from '../components/WrongNetwork';
import LayoutView from '../layout';

const intlOnError: React.ComponentPropsWithoutRef<typeof IntlProvider>['onError'] = (err) => {
  if (err.code === 'MISSING_TRANSLATION') {
    return;
  }

  throw err;
};

type AppWithLayoutProps = AppProps & {
  Component: NextPageWithLayout;
};
export type NextPageWithLayout<P = Record<string, unknown>> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

function MyApp({ Component, pageProps, router }: AppWithLayoutProps) {
  const locale = (() => {
    const result = router.locale ?? router.defaultLocale ?? 'en';
    if (Object.keys(languages).includes(result)) {
      return result as keyof typeof languages;
    }

    return 'en';
  })();

  const messages = useMemo(() => ({ ...languages.en, ...languages[locale] }), [locale]);

  const getLayout = Component.getLayout || ((page) => <LayoutView>{page}</LayoutView>);

  return (
    <ApolloProvider client={apolloClient}>
      <IntlProvider messages={messages} locale={locale} defaultLocale="en" onError={intlOnError}>
        <ErrorBoundary fallbackRender={(props) => <GeneralError {...props} />}>
          <PulsarThemeProvider theme={'auto'}>
            <PulsarGlobalStyles />
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

                {getLayout(<Component {...pageProps} />)}
              </>
              <WrongNetwork />
            </OnboardProvider>
          </PulsarThemeProvider>
        </ErrorBoundary>
      </IntlProvider>
    </ApolloProvider>
  );
}

export default MyApp;
