// app/entry.client.tsx
import { hydrateRoot } from "react-dom/client";
import { RemixBrowser } from "@remix-run/react";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  uri: "/api/graphql",
  cache: new InMemoryCache(),
});

hydrateRoot(
  document,
  <ApolloProvider client={client}>
    <RemixBrowser />
  </ApolloProvider>
);