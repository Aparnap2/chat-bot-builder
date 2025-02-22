// app/graphql/client.server.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { schema } from '../../graphql/schema';

// Create an Apollo Client instance with SchemaLink, passing the user context
export function createClient(user: any) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    ssrMode: true, // Enable SSR mode for server-side rendering
    link: new SchemaLink({
      schema,
      context: () => ({ user }), // Provide user context to resolvers
    }),
  });
}