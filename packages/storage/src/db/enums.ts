// Drizzle enums for PostgreSQL
import { pgEnum } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Organization role enum
export const organizationRoleEnum = pgEnum('organization_role', [
  'owner',
  'admin',
  'member',
  'viewer',
]);

// Zod enum for validation
export const organizationRoleZodEnum = z.enum(['owner', 'admin', 'member', 'viewer']);
