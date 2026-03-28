import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";


const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL?.trim() || configuredUrl;

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: graphqlUrl,
  }),
  cache: new InMemoryCache(),
});