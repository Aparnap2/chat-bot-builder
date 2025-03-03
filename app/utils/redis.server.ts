import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "~/config/env";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(10, "10000000d"), // 10 responses per lifetime
  analytics: true,
  prefix: "chatbot:ratelimit",
});

export async function checkRateLimit(userId: string) {
  const { success, remaining } = await rateLimiter.limit(userId);
  return { success, remaining };
}