/**
 * API Server Entry Point
 * 
 * oRPC server with TanStack Start integration
 */

import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { initSentry } from './lib/sentry';
import { initDatadog } from './lib/datadog';
import { appRouter } from './routers';

// Initialize monitoring
initSentry();
// Datadog initialization - skip if dd-trace fails (common in dev environments)
// Note: initDatadog is async but we don't await it to avoid blocking startup
initDatadog().catch((error) => {
  console.warn("Datadog initialization failed (this is OK in dev):", error);
});

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error: unknown) => {
      console.error("[RPC Error]", error);
    }),
  ],
});

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '0.0.0.0';

const server = Bun.serve({
  port,
  hostname: host,
  fetch: async (request) => {
    console.log(`[${request.method}] ${request.url}`);
    const result = await handler.handle(request);
    console.log('Match result:', result.matched);
    if (result.matched) {
      return result.response;
    }
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🚀 API server running on http://${server.hostname}:${server.port}`);
console.log(`📚 OpenAPI spec available at http://${server.hostname}:${server.port}/openapi.json`);
