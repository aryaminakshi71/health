// Zod validators derived from Drizzle schemas
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { users, organizations, members } from './auth.schema'

// === Users ===
export const selectUserSchema = createSelectSchema(users)
export const insertUserSchema = createInsertSchema(users)
export const createUserSchema = insertUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})
export const updateUserSchema = insertUserSchema.partial()

// === Organizations ===
export const selectOrganizationSchema = createSelectSchema(organizations)

export const insertOrganizationSchema = createInsertSchema(organizations, {
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  region: z.enum(['india', 'usa', 'europe', 'dubai']),
})

export const createOrganizationSchema = insertOrganizationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateOrganizationSchema = insertOrganizationSchema.partial()

// === Members ===
export const selectMemberSchema = createSelectSchema(members)
export const insertMemberSchema = createInsertSchema(members)

export const updateMemberRoleSchema = insertMemberSchema
  .pick({
    role: true,
  })
  .partial()
