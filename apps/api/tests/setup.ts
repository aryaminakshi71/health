/**
 * Test Setup
 * 
 * Global test configuration
 */

import { beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let testDb: ReturnType<typeof drizzle>;
let testClient: ReturnType<typeof postgres>;

beforeAll(async () => {
  // Setup test database connection
  const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('TEST_DATABASE_URL or DATABASE_URL must be set');
  }

  testClient = postgres(connectionString);
  testDb = drizzle(testClient);
});

afterAll(async () => {
  // Cleanup
  await testClient.end();
});

export { testDb, testClient };
