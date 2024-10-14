import 'src/styles/globals.css';

import { useEffect } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { IntlProvider } from 'react-intl';

import { defaultLocale, locales } from 'src/localization';
import { useLanguageDirection } from 'src/utils/useLanguageDirection';

require('src/migration').migration();

const MyApp = ({ Component, pageProps }: AppProps) => {

  useEffect(() => {
    const preventBrowserShortcut = e => {
      if (e.ctrlKey && 'gmi'.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventBrowserShortcut);

    return () => window.removeEventListener('keydown', preventBrowserShortcut);
  }, []);

  const { metadata } = pageProps || {};
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const { asPath } = useRouter();

  const href = asPath.replace('/en', '/').replace('//', '/');

  const direction = useLanguageDirection()

  return (
    <IntlProvider
      messages={pageProps.messages}
      locale={pageProps.lang}
      defaultLocale={defaultLocale}
    >
      {metadata && (
        <Head>
          <title>{metadata.title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <meta name="description" content={metadata.description} />
          {typeof metadata.hrefLang === 'string' &&
            locales.map(locale => (
              <link
                key={locale}
                rel="alternate"
                hrefLang={locale}
                href={`${process.env.NEXT_PUBLIC_BASE_URL}${locale === 'en' ? '' : locale + '/'}${metadata.hrefLang
                  }`}
              />
            ))}
          {/* <!-- Facebook Meta Tags --> */}
          <meta property="og:url" content={baseURL + href} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={metadata.title} />
          <meta property="og:description" content={metadata.description} />
          <meta property="og:image" content={baseURL + '/images/og-regexlearn-image.jpg'} />

          {/* <!-- Twitter Meta Tags --> */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="regexlearn.com" />
          <meta property="twitter:url" content={baseURL + href} />
          <meta name="twitter:title" content={metadata.title} />
          <meta name="twitter:description" content={metadata.description} />
          <meta name="twitter:image" content={baseURL + '/images/og-regexlearn-image.jpg'} />
          {direction === 'rtl' && (
            <>
              <link
                href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
                rel="stylesheet"
                type="text/css"
              />
              <link rel="stylesheet" href="/css/rtl.css" />
            </>
          )}
        </Head>
      )}
      <div dir={direction} className="flex flex-col h-screen text-neutral-50 font-openSans">
        <Component {...pageProps} />
      </div>
    </IntlProvider>
  );
};

export default MyApp;
