/**
 * API Context Types
 *
 * Defines the context types for oRPC procedures.
 */

import type { KVNamespace, R2Bucket, Fetcher } from "@cloudflare/workers-types";

/**
 * Cloudflare Worker environment bindings
 */
export interface AppEnv {
  DATABASE?: { connectionString: string };
  DATABASE_URL?: string;
  CACHE?: KVNamespace;
  BUCKET?: R2Bucket;
  ASSETS?: Fetcher;
  BETTER_AUTH_SECRET?: string;
  VITE_PUBLIC_SITE_URL?: string;
  NODE_ENV?: string;
}

/**
 * Initial context provided at request start
 */
export interface InitialContext {
  env?: AppEnv;
  headers: Headers;
  requestId: string;
  logger?: any;
}
