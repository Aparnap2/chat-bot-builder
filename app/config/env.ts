import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3000",
  KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID || "",
  KINDE_CLIENT_SECRET: process.env.KINDE_CLIENT_SECRET || "",
  KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL || "",
  KINDE_SITE_URL: process.env.KINDE_SITE_URL || "http://localhost:5173",
  KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL || "http://localhost:5173",
  KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL || "http://localhost:5173/profile",
  ASTRA_DB_APPLICATION_TOKEN: process.env.ASTRA_DB_APPLICATION_TOKEN || "",
  ASTRA_DB_ENDPOINT: process.env.ASTRA_DB_ENDPOINT || "",
  ASTRA_DB_COLLECTION: process.env.ASTRA_DB_COLLECTION || "chatbot_docs",
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",
};