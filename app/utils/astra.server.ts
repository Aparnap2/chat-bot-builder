// ~/utils/astra.server.ts
import { DataAPIClient, Db } from "@datastax/astra-db-ts";

/**
 * Connects to a DataStax Astra database.
 * Expects the environment variables:
 *   ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN.
 */
export function connectToDatabase(): Db {
  const { ASTRA_DB_API_ENDPOINT: endpoint, ASTRA_DB_APPLICATION_TOKEN: token } = process.env;
  if (!token || !endpoint) {
    throw new Error("ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined.");
  }
  const client = new DataAPIClient(token);
  const database = client.db(endpoint);
  console.log(`Connected to database ${database.id}`);
  return database;
}
