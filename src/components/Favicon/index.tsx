import Head from 'next/head';

export const Favicon = () => {
  const mode = 'production';
  return (
    <Head>
      <link rel="icon" type="image/svg+xml" href={`/favicon/favicon-${mode}.svg`} />

      <link rel="alternate icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="alternate icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      <link rel="alternate icon" href="/favicon.ico" />

      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#2b374a" />

      <link rel="manifest" href="/site.webmanifest" />
      <meta name="msapplication-TileColor" content="#2b374a" />
      <meta name="theme-color" content="#2b374a" />
    </Head>
  );
};
