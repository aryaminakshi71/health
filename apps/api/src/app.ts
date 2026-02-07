/**
 * API Application
 * 
 * Hono app with oRPC integration
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { RPCHandler } from "@orpc/server/fetch";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { onError } from "@orpc/server";
import { appRouter } from "./routers";
import { createAuthFromEnv } from "./lib/create-auth-from-env";
import { createDb } from "./lib/create-db";
import { initSentry } from "./lib/sentry";
import { setSecurityHeaders } from "./lib/security";
import type { AppEnv } from "./context";

export function createApp() {
  const app = new Hono<{ Bindings: AppEnv }>();

  // Initialize monitoring
  initSentry();

  // Global middleware
  app.use("*", cors({ origin: (origin: string | null) => origin, credentials: true }));
  app.use("*", requestId());
  
  // Security headers middleware
  app.use("*", async (c, next) => {
    await next();
    setSecurityHeaders(c.res.headers);
  });

  // Health check
  app.get("/api/health", (c) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  // Better Auth handler
  app.on(["GET", "POST"], "/api/auth/*", async (c: any) => {
    const envBindings = c.env || {};
    const connectionString =
      envBindings.DATABASE?.connectionString || process.env.DATABASE_URL;

    if (!connectionString) {
      return c.json({ error: "Database not configured" }, 500);
    }

    try {
      const db = createDb({ connectionString });
      const auth = createAuthFromEnv(db, {
        DATABASE_URL: connectionString,
        NODE_ENV: envBindings.NODE_ENV || process.env.NODE_ENV || "development",
        VITE_PUBLIC_SITE_URL: envBindings.VITE_PUBLIC_SITE_URL || process.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000",
        BETTER_AUTH_SECRET: envBindings.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || "dev-secret",
      });
      return await auth.handler(c.req.raw);
    } catch (e) {
      console.error("[Auth Error]", e);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  });

  // oRPC handler
  const rpcHandler = new RPCHandler(appRouter, {
    interceptors: [
      onError((error: unknown) => {
        console.error("[RPC Error]", error);
      }),
    ],
  });

  app.use("/api/rpc/*", async (c, next) => {
    const { matched, response } = await rpcHandler.handle(c.req.raw, {
      prefix: "/api/rpc",
      context: { headers: c.req.raw.headers },
    });

    if (matched && response) {
      return c.newResponse(response.body, response);
    }

    await next();
  });

  // OpenAPI spec
  app.get("/api/openapi.json", async (c) => {
    const generator = new OpenAPIGenerator({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    });

    const spec = await generator.generate(appRouter, {
      info: {
        title: "Health API",
        version: "1.0.0",
        description: "Healthcare SaaS API",
      },
      servers: [
        {
          url: c.env?.VITE_PUBLIC_SITE_URL || "http://localhost:3000",
          description: "Current",
        },
      ],
    });

    return c.json(spec);
  });

  // API docs
  app.get("/api/docs", async (c) => {
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>API Documentation</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@scalar/api-reference/style.css" />
      </head>
      <body>
        <script id="api-reference" data-url="/api/openapi.json"></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
      </html>
    `);
  });

  return app;
}

export const api = createApp();
