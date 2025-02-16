// app/utils/redis.server.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Distributed rate limiter function.
// Returns true if under limit, false if exceeded.
// Redis rate limiter integration
export async function rateLimiter(request: Request) {
  const ip = request.headers.get("CF-Connecting-IP") || "localhost";
  const key = `rate:${ip}`;
  
  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, 60);
  
  if (current > 100) {
    throw new Response("Rate limit exceeded", { status: 429 });
  }
}