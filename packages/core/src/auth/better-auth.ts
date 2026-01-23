/**
 * Better Auth Configuration
 * 
 * Authentication and organization management setup
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '@healthcare-saas/storage/db/schema';

// Initialize database connection for Better Auth
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// Better Auth configuration
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'postgres',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  organization: {
    enabled: true,
    requireMFA: false, // Can be enabled per organization
  },
  socialProviders: {
    // Add social providers as needed
    // google: { ... },
    // github: { ... },
  },
  secret: process.env.BETTER_AUTH_SECRET || 'change-me-in-production',
  baseURL: process.env.BETTER_AUTH_URL || process.env.VITE_PUBLIC_SITE_URL || 'http://localhost:3000',
});

// Export auth client for use in procedures
export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
