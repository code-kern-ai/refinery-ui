import type { AppProps } from 'next/app'
import '../styles/tailwind.css'
import Head from 'next/head'
import Layout from '../components/shared/layout/Layout'
import { Provider } from 'react-redux'
import store from '../reduxStore/store'
import { GlobalStoreDataComponent } from '../reduxStore/StoreManagerComponent'
import { ConfigManager } from '../services/base/config'
import { useEffect } from 'react'

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
      <GlobalStoreDataComponent>
        <Layout {...pageProps}>
          <Component {...pageProps} />
        </Layout>
      </GlobalStoreDataComponent>
    </Provider>
  </>
}
