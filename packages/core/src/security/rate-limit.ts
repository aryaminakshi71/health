import { Hono } from 'hono';
import type { Context, Next } from 'hono';

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;

const ipCache = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header('CF-Connecting-IP') || 
             c.req.header('X-Forwarded-For') || 
             'unknown';
  
  const now = Date.now();
  const record = ipCache.get(ip);

  if (record && now < record.resetTime) {
    if (record.count >= RATE_LIMIT_MAX) {
      return c.json({ error: 'Too many requests' }, 429);
    }
    record.count++;
  } else {
    ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }

  await next();
};

export const strictRateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header('CF-Connecting-IP') || 
             c.req.header('X-Forwarded-For') || 
             'unknown';
  
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;
  
  const record = ipCache.get(ip);

  if (record && now < record.resetTime) {
    if (record.count >= maxRequests) {
      return c.json({ error: 'Too many requests' }, 429);
    }
    record.count++;
  } else {
    ipCache.set(ip, { count: 1, resetTime: now + windowMs });
  }

  await next();
};

export const authRateLimitMiddleware = async (c: Context, next: Next) => {
  const ip = c.req.header('CF-Connecting-IP') || 
             c.req.header('X-Forwarded-For') || 
             'unknown';
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 5;
  
  const record = ipCache.get(`auth:${ip}`);

  if (record && now < record.resetTime) {
    if (record.count >= maxRequests) {
      return c.json({ error: 'Too many login attempts' }, 429);
    }
    record.count++;
  } else {
    ipCache.set(`auth:${ip}`, { count: 1, resetTime: now + windowMs });
  }

  await next();
};

export function cleanupRateLimitCache() {
  const now = Date.now();
  for (const [key, value] of ipCache.entries()) {
    if (now >= value.resetTime) {
      ipCache.delete(key);
    }
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitCache, 60 * 1000);
}
