/**
 * API Server Entry Point
 * 
 * oRPC server with TanStack Start integration
 */

import { createServer } from '@orpc/server';
import { initSentry } from './lib/sentry';
import { initDatadog } from './lib/datadog';
import { appRouter } from './routers';

// Initialize monitoring
initSentry();
initDatadog();

const server = createServer({
  router: appRouter,
});

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';

server.listen(port, host, () => {
  console.log(`🚀 API server running on http://${host}:${port}`);
  console.log(`📚 OpenAPI spec available at http://${host}:${port}/openapi.json`);
});
