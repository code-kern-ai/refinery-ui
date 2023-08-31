import { ApolloProvider } from '@apollo/client'
import type { AppProps } from 'next/app'
import client from '../services/gql/apollo-client'
import '../styles/tailwind.css'
import Head from 'next/head'
import Layout from '../components/shared/layout/Layout'
import { Provider } from 'react-redux'
import store from '../reduxStore/store'
import { GlobalStoreDataComponent } from '../reduxStore/StoreManagerComponent'

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <title>Kern AI - refinery</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="icon" type="image/x-icon" href="/refinery/images/refinery-favicon.ico"></link>
    </Head>

    <Provider store={store}>
      <ApolloProvider client={client}>
        <GlobalStoreDataComponent>
          {/* TODO: The layout is removed because of iframe in Angular
           <Layout {...pageProps}> */}
          <Component {...pageProps} />
          {/* </Layout> */}
        </GlobalStoreDataComponent>
      </ApolloProvider>
    </Provider>
  </>
}
