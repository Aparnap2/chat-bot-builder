// app/utils/redis.server.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Distributed rate limiter function.
// Returns true if under limit, false if exceeded.
export async function rateLimiter(ip: string): Promise<boolean> {
  const rateLimitWindow = 60; // seconds
  const rateLimitMax = 100; // max 100 requests per window
  const key = `rate:${ip}`;
  
  const current = await redis.incr(key);
  if (current === 1) {
    // Set expiration on first increment
    await redis.expire(key, rateLimitWindow);
  }
  return current <= rateLimitMax;
}
