import { ApolloProvider } from '@apollo/client'
import type { AppProps } from 'next/app'
import client from '../services/gql/apollo-client'
import '../styles/tailwind.css'
import Head from 'next/head'
import Layout from '../components/shared/layout/Layout'
import { Provider } from 'react-redux'
import store from '../reduxStore/store'
import { GlobalStoreDataComponent } from '../reduxStore/StoreManagerComponent'
import { ConfigManager } from '../services/base/config'
import { useEffect } from 'react'
import { RouteManager } from '../services/base/route-manager'

export default function App({ Component, pageProps }: AppProps) {

  useEffect(() => {
    ConfigManager.refreshConfig();
  }, []);

  return <>
    <Head>
      <title>Kern AI - refinery</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="icon" type="image/x-icon" href="/refinery/images/refinery-favicon.ico"></link>
    </Head>

    <Provider store={store}>
      <ApolloProvider client={client}>
        <GlobalStoreDataComponent>
          <Layout {...pageProps}>
            <Component {...pageProps} />
          </Layout>
        </GlobalStoreDataComponent>
      </ApolloProvider>
    </Provider>
  </>
}
