/**
 * Notes Router - Example Feature
 *
 * Demonstrates the oRPC pattern:
 * - Zod schemas for input/output validation
 * - Organization-scoped procedures
 * - CRUD operations with proper error handling
 *
 * This is an example for the template - modify for your domain.
 */

import { z } from "zod";
import { eq, and, ilike, desc } from "drizzle-orm";
import { orgAuthed, getDb, schema } from "../procedures";
import { ORPCError } from "@orpc/server";

export const notesRouter = {
  /**
   * List notes for the organization
   */
  list: orgAuthed
    .route({
      method: "GET",
      path: "/notes",
      summary: "List notes",
      tags: ["Notes"],
    })
    .input(
      z.object({
        status: z.enum(["active", "archived"]).optional(),
        search: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(100),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        notes: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);
      const { status, search, limit, offset } = input;

      // Build where conditions
      const conditions = [
        eq(schema.notes.organizationId, context.organization.id),
      ];

      if (status) {
        conditions.push(eq(schema.notes.status, status));
      }

      if (search) {
        conditions.push(ilike(schema.notes.title, `%${search}%`));
      }

      // Query with pagination
      const notes = await db
        .select()
        .from(schema.notes)
        .where(and(...conditions))
        .orderBy(desc(schema.notes.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count (simplified - would use count() in real implementation)
      const total = notes.length;

      return {
        notes,
        total,
      };
    }),
};
