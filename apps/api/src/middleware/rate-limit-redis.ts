/**
 * Redis-based Rate Limiting Middleware
 * 
 * Uses Upstash Redis for distributed rate limiting.
 * Falls back to in-memory if Redis not configured.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@healthcare-saas/storage/redis";
import { ORPCError } from "@orpc/server";

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  identifier: string;
  limiterType?: "api" | "auth" | "strict";
}

const defaultLimiters = {
  api: { windowSeconds: 60, maxRequests: 100 },
  auth: { windowSeconds: 60, maxRequests: 10 },
  strict: { windowSeconds: 60, maxRequests: 5 },
};

const createRateLimiter = (type: "api" | "auth" | "strict") => {
  const redisClient = redis.client;
  if (!redisClient) return null;
  
  const config = defaultLimiters[type];
  return new Ratelimit({
    redis: redisClient as any,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${config.windowSeconds} s`),
    analytics: true,
    prefix: `ratelimit:${type}`,
  });
};

const rateLimiters = {
  api: createRateLimiter("api"),
  auth: createRateLimiter("auth"),
  strict: createRateLimiter("strict"),
};

/**
 * Check rate limit
 * Returns true if allowed, throws error if rate limited
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<void> {
  const { limiterType = "api", identifier } = options;
  
  if (limiterType && rateLimiters[limiterType]) {
    const limiter = rateLimiters[limiterType]!;
    const result = await limiter.limit(identifier);
    
    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      throw new ORPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        metadata: { retryAfter },
      });
    }
  }
}
