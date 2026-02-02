/**
 * Database Connection Helper
 *
 * Creates a Drizzle database instance optimized for Cloudflare Workers with Neon.
 * Supports Hyperdrive (Cloudflare Workers) or direct PostgreSQL connection.
 *
 * In Cloudflare Workers:
 * - Use env.DATABASE.connectionString (from Hyperdrive binding)
 * - Automatically uses Neon serverless driver optimized for edge runtime
 *
 * In local development:
 * - Use connectionString parameter or DATABASE_URL env var
 */

import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neonConfig } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from '@healthcare-saas/storage/db/schema';

export interface HyperdriveConnection {
  connectionString: string;
}

export function createDb(
  connectionString?: string | HyperdriveConnection | { connectionString: string },
) {
  let url: string;

  if (typeof connectionString === "string") {
    url = connectionString;
  } else if (connectionString && "connectionString" in connectionString) {
    url = connectionString.connectionString;
  } else {
    url = process.env.DATABASE_URL!;
  }

  if (!url) {
    throw new Error('DATABASE_URL or DATABASE.connectionString (Hyperdrive) is not set');
  }

  // Determine if we're in local development
  const isLocal = url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    process.env.NODE_ENV === "development";

  if (isLocal) {
    // Local development: Use postgres.js for TCP connections
    const client = postgres(url, {
      max: 20,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: false,
    });
    return drizzlePostgres(client, { schema }) as any;
  }

  // Production/Cloudflare: Use Neon Serverless (works with Hyperdrive connection strings)
  // Optimize Neon for Cloudflare Workers
  neonConfig.fetchConnectionCache = true;

  // drizzle-orm/neon-serverless accepts connection string directly
  return drizzleNeon(url, { schema }) as any;
}
