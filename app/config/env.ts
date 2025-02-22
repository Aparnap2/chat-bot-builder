// app/config/env.ts
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3000",
  ASTRA_DB_APPLICATION_TOKEN: process.env.ASTRA_DB_APPLICATION_TOKEN || "",
  ASTRA_DB_ENDPOINT: process.env.ASTRA_DB_ENDPOINT || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",
};