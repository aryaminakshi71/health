/**
 * Logger Middleware
 *
 * Request-scoped logging middleware for Hono.
 */

import type { Context, Next } from "hono";

const SKIP_PATHS = ["/api/health", "/health", "/favicon.ico", "/robots.txt"];

declare module "hono" {
  interface ContextVariableMap {
    logger: {
      info: (message: string, meta?: any) => void;
      error: (message: string, meta?: any) => void;
      warn: (message: string, meta?: any) => void;
    };
  }
}

export async function loggerMiddleware(c: Context, next: Next) {
  const requestId = c.get("requestId") || crypto.randomUUID();
  c.header("X-Request-Id", requestId);

  const logger = {
    info: (message: string, meta?: any) => {
      console.log(`[INFO] ${message}`, meta || '');
    },
    error: (message: string, meta?: any) => {
      console.error(`[ERROR] ${message}`, meta || '');
    },
    warn: (message: string, meta?: any) => {
      console.warn(`[WARN] ${message}`, meta || '');
    },
  };

  c.set("logger", logger);

  const start = Date.now();
  await next();

  // Skip logging for noisy paths
  if (!SKIP_PATHS.some((p) => c.req.path.startsWith(p))) {
    logger.info("Request completed", {
      status: c.res.status,
      duration: Date.now() - start,
    });
  }
}
