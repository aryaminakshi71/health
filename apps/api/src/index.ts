/**
 * API Server Entry Point
 * 
 * oRPC server with TanStack Start integration
 */

import { RPCHandler } from '@orpc/server/fetch';
import { os } from '@orpc/server';
import { initSentry } from './lib/sentry';
import { initDatadog } from './lib/datadog';
import { appRouter } from './routers';

// Initialize monitoring
initSentry();
initDatadog();

const handler = new RPCHandler(os.router(appRouter));

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
