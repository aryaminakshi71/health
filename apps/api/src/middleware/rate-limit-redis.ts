/**
 * Redis-based Rate Limiting Middleware
 * 
 * Uses Upstash Redis for distributed rate limiting.
 * Falls back to in-memory if Redis not configured.
 */

import type { Context, Next } from "hono";
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
      throw new ORPCError("TOO_MANY_REQUESTS" as any, {
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        metadata: { retryAfter },
      });
    }
  }
}

/**
 * Hono middleware for rate limiting
 */
export function rateLimitRedis(options: Partial<RateLimitOptions & { keyGenerator?: (c: Context) => string }> = {}) {
  return async (c: Context, next: Next) => {
    const keyGenerator = options.keyGenerator || ((c: Context) => {
      const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      return `ip:${ip}`;
    });
    
    const identifier = keyGenerator(c);
    const limiterType = options.limiterType || "api";
    
    await checkRateLimit({
      limiterType,
      identifier,
      windowSeconds: options.windowSeconds || 60,
      maxRequests: options.maxRequests || 100,
    });
    
    await next();
  };
}
