import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental';
import { ReactQueryDevtools } from 'react-query/devtools';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { RecoilRoot } from 'recoil';
import { NotificationsProvider } from '@mantine/notifications';
import GlobalStyles from '../styles/globalStyles';
import Layout from '../components/Layout/Layout';
import { theme } from '../styles/theme';

const App = (props: AppProps) => {
  const { Component, pageProps } = props;

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 1000 * 60 * 60 * 6 // 6 hours
      },
    },
  });

  useEffect(() => {
    const localStoragePersistor = createWebStoragePersistor({
      storage: window.localStorage,
      key: 'visionSync_Cache',
      throttleTime: 0
    });

    persistQueryClient({
      queryClient,
      persistor: localStoragePersistor,
    });
  });

  return (
    <>
      <Head>
        <title>VisionSync</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: 'dark',
          ...theme
        }}
      >
        <NotificationsProvider>
          <QueryClientProvider client={queryClient}>
            <RecoilRoot>
              <Layout>
                <Component {...pageProps} />
              </Layout>
              <GlobalStyles />
              <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            </RecoilRoot>
          </QueryClientProvider>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
};

export default App;
