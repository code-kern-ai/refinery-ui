import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const link = createHttpLink({
    uri: 'http://localhost:4455/graphql/',
    credentials: 'include'

});

const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache(),
});

export default client;