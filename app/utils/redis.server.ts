// app/utils/redis.server.ts
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { RateLimiterResponse } from "../types/types";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"), // 100 requests per minute
  analytics: true,
  prefix: "chatbot:ratelimit",
});

export async function limitRequest(ip: string): Promise<RateLimiterResponse> {
  return rateLimiter.limit(ip);
}