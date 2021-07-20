import { AppProps } from 'next/app';
import { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import Head from 'next/head';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities'; // eslint-disable-line import/no-internal-modules
import { RetryLink } from '@apollo/client/link/retry'; // eslint-disable-line import/no-internal-modules

import { languages } from '../modules/i18n';
import { Favicon } from '../components/Favicon';
import { GlobalStyles } from '../modules/styles';
import { OnboardProvider } from '../modules/onboard';

const apolloClient = new ApolloClient({
  link: new RetryLink().split(
    (operation) => operation.getContext().serviceName === 'skybridge',
    new HttpLink({ uri: 'https://network.skybridge.exchange/api/v3/graphql' }),
    new HttpLink({ uri: '/api/graphql' }),
  ),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          transactions: relayStylePagination(['where']),
        },
      },
    },
  }),
});

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
        </OnboardProvider>
      </IntlProvider>
    </ApolloProvider>
  );
}

export default MyApp;
