import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@healthcare-saas/env/server';

const queryClient = postgres(env.DATABASE_URL, { max: 10 });
export const db = drizzle(queryClient);
