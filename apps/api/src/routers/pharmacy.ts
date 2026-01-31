/**
 * Pharmacy Router
 * 
 * Prescription dispensing and inventory management
 */

import { z } from 'zod';
import { eq, and, desc, count, ilike, or, lte } from 'drizzle-orm';
import { complianceAudited, getDb, schema } from '../procedures';
import { ORPCError } from '@orpc/server';
import { pharmacyInventory, pharmacyDispensations, medicationCatalog } from '@healthcare-saas/storage/db/schema';

// Validation schemas
const dispensePrescriptionSchema = z.object({
  prescriptionId: z.string().uuid(),
  inventoryId: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
});

const updateInventorySchema = z.object({
  medicationId: z.string().uuid(),
  quantity: z.number().int(),
  operation: z.enum(['add', 'subtract', 'set']),
  batchNumber: z.string().optional(),
  lotNumber: z.string().optional(),
  expiryDate: z.string().date().optional(),
  supplierName: z.string().optional(),
  supplierPrice: z.number().optional(),
});

// Generate dispensation number helper
function generateDispensationNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase();
  const paddedCount = String(count + 1).padStart(6, '0');
  return `DSP-${prefix}-${paddedCount}`;
}

export const pharmacyRouter = {
  /**
   * Get medication catalog
   */
  getMedicationCatalog: complianceAudited
    .route({
      method: 'GET',
      path: '/pharmacy/medications',
      summary: 'Get medication catalog',
      tags: ['Pharmacy'],
    })
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
        offset: z.coerce.number().int().min(0).optional().default(0),
      }),
    )
    .output(
      z.object({
        medications: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(medications.organizationId, context.organization.id),
      ];

      if (input.search) {
        conditions.push(
          or(
            ilike(medications.medicationName, `%${input.search}%`),
            ilike(medications.genericName, `%${input.search}%`),
          ),
        );
      }

      const medicationsList = await db
        .select()
        .from(medications)
        .where(and(...conditions))
        .orderBy(medications.medicationName)
        .limit(input.limit)
        .offset(input.offset);

      const totalResult = await db
        .select({ count: count() })
        .from(medications)
        .where(and(...conditions));

      return {
        medications: medicationsList,
        total: totalResult[0]?.count || 0,
      };
    }),

  /**
   * Dispense prescription
   */
  dispense: complianceAudited
    .route({
      method: 'POST',
      path: '/pharmacy/dispense',
      summary: 'Dispense prescription',
      tags: ['Pharmacy'],
    })
    .input(dispensePrescriptionSchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Get prescription (from prescriptions router)
      // This would need to import prescriptions table
      // For now, assume prescription exists

      // Check inventory if inventoryId provided
      if (input.inventoryId) {
        const inventory = await db.query.pharmacyInventory.findFirst({
          where: (inventory, { eq }) => eq(inventory.id, input.inventoryId),
        });

        if (!inventory) {
          throw new ORPCError({
            code: 'NOT_FOUND',
            message: 'Inventory item not found',
          });
        }

        if (inventory.currentStock < input.quantity) {
          throw new ORPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient stock',
          });
        }

        // Update inventory
        await db
          .update(pharmacyInventory)
          .set({
            currentStock: inventory.currentStock - input.quantity,
            updatedAt: new Date(),
          })
          .where(eq(pharmacyInventory.id, input.inventoryId));
      }

      // Get dispensation count
      const countResult = await db
        .select({ count: count() })
        .from(pharmacyDispensations)
        .where(eq(pharmacyDispensations.organizationId, context.organization.id));

      const dispensationCount = countResult[0]?.count || 0;
      const dispensationNumber = generateDispensationNumber(
        context.organization.id,
        dispensationCount,
      );

      const [newDispensation] = await db
        .insert(pharmacyDispensations)
        .values({
          organizationId: context.organization.id,
          prescriptionId: input.prescriptionId,
          inventoryId: input.inventoryId,
          dispensationNumber,
          dispensationDate: new Date().toISOString().split('T')[0],
          quantity: input.quantity,
          status: 'dispensed',
          dispensedAt: new Date(),
          dispensedBy: context.user.id,
          notes: input.notes,
        })
        .returning();

      return newDispensation;
    }),

  /**
   * Get inventory
   */
  getInventory: complianceAudited
    .route({
      method: 'GET',
      path: '/pharmacy/inventory',
      summary: 'Get pharmacy inventory',
      tags: ['Pharmacy'],
    })
    .input(
      z.object({
        medicationId: z.string().uuid().optional(),
        lowStock: z.boolean().optional(),
        expired: z.boolean().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
      }),
    )
    .output(z.array(z.any()))
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(pharmacyInventory.organizationId, context.organization.id),
        eq(pharmacyInventory.isActive, true),
      ];

      if (input.medicationId) {
        conditions.push(eq(pharmacyInventory.medicationId, input.medicationId));
      }

      if (input.lowStock) {
        // This would need a subquery or join to compare currentStock with reorderPoint
        // Simplified for now
      }

      if (input.expired) {
        conditions.push(lte(pharmacyInventory.expiryDate, new Date().toISOString().split('T')[0]));
        conditions.push(eq(pharmacyInventory.isExpired, false)); // Not yet marked as expired
      }

      const inventory = await db
        .select()
        .from(pharmacyInventory)
        .where(and(...conditions))
        .limit(input.limit);

      return inventory;
    }),

  /**
   * Update inventory
   */
  updateInventory: complianceAudited
    .route({
      method: 'POST',
      path: '/pharmacy/inventory',
      summary: 'Update inventory',
      tags: ['Pharmacy'],
    })
    .input(updateInventorySchema)
    .output(z.any())
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      // Find or create inventory item
      const inventory = await db.query.pharmacyInventory.findFirst({
        where: (inventory, { eq, and }) =>
          and(
            eq(inventory.organizationId, context.organization.id),
            eq(inventory.medicationId, input.medicationId),
          ),
      });

      if (!inventory) {
        // Create new inventory item
        const [newInventory] = await db
          .insert(pharmacyInventory)
          .values({
            organizationId: context.organization.id,
            medicationId: input.medicationId,
            currentStock: input.operation === 'set' ? input.quantity : 0,
            reorderPoint: 10,
            reorderQuantity: 100,
            batchNumber: input.batchNumber,
            lotNumber: input.lotNumber,
            expiryDate: input.expiryDate,
            supplierName: input.supplierName,
            supplierPrice: input.supplierPrice?.toString(),
          })
          .returning();

        return newInventory;
      }

      // Update existing inventory
      let newStock = inventory.currentStock;
      if (input.operation === 'add') {
        newStock += input.quantity;
      } else if (input.operation === 'subtract') {
        newStock -= input.quantity;
      } else if (input.operation === 'set') {
        newStock = input.quantity;
      }

      const [updatedInventory] = await db
        .update(pharmacyInventory)
        .set({
          currentStock: newStock,
          batchNumber: input.batchNumber || inventory.batchNumber,
          lotNumber: input.lotNumber || inventory.lotNumber,
          expiryDate: input.expiryDate || inventory.expiryDate,
          supplierName: input.supplierName || inventory.supplierName,
          supplierPrice: input.supplierPrice?.toString() || inventory.supplierPrice,
          updatedAt: new Date(),
        })
        .where(eq(pharmacyInventory.id, inventory.id))
        .returning();

      return updatedInventory;
    }),

  /**
   * Get medication catalog
   */
  getMedicationCatalog: complianceAudited
    .route({
      method: 'GET',
      path: '/pharmacy/medications',
      summary: 'Get medication catalog',
      tags: ['Pharmacy'],
    })
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(50),
      }),
    )
    .output(z.array(z.any()))
    .handler(async ({ context, input }) => {
      const db = getDb(context);

      const conditions = [
        eq(medicationCatalog.organizationId, context.organization.id),
        eq(medicationCatalog.isActive, true),
      ];

      if (input.search) {
        conditions.push(
          or(
            ilike(medicationCatalog.medicationName, `%${input.search}%`),
            ilike(medicationCatalog.genericName, `%${input.search}%`),
            ilike(medicationCatalog.ndcCode, `%${input.search}%`),
          )!,
        );
      }

      const medications = await db
        .select()
        .from(medicationCatalog)
        .where(and(...conditions))
        .limit(input.limit);

      return medications;
    }),
};
