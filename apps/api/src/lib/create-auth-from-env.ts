/**
 * Shared Auth Configuration
 *
 * Creates a Better Auth instance from environment bindings.
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@healthcare-saas/storage/db/schema';
import type { AppEnv } from '../context';

export function createAuthFromEnv(db: ReturnType<typeof drizzle>, env: AppEnv) {
  const baseURL = env.VITE_PUBLIC_SITE_URL || 'http://localhost:3003';

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'postgres',
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    organization: {
      enabled: true,
      requireMFA: false,
    },
    secret: env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || 'change-me-in-production',
    baseURL,
  });
}
