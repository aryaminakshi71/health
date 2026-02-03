/**
 * Test Utilities for Health App
 * 
 * Shared utilities for testing oRPC routers
 */

import type { OrgAuthedContext } from "../procedures";
import type { Logger } from "@healthcare-saas/logger";

/**
 * Create mock logger for tests
 */
export function createMockLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
    trace: () => {},
    child: () => createMockLogger(),
  };
}

/**
 * Create mock organization context
 */
export function createMockOrgContext(overrides: Partial<OrgAuthedContext> = {}): OrgAuthedContext {
  return {
    headers: new Headers(overrides.headers || {}),
    request: overrides.request,
    user: overrides.user || {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      organizationId: "test-org-id",
      role: "admin",
    },
    organization: overrides.organization || {
      id: "test-org-id",
      name: "Test Organization",
      region: "usa" as const,
      complianceSettings: {
        hipaa: true,
        gdpr: false,
        ndhm: false,
        sharia: false,
      },
    },
  };
}

/**
 * Test data factory for patients
 */
export async function createTestPatient(
  db: any,
  context: OrgAuthedContext,
  data: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } = {}
) {
  const { patients } = await import("@healthcare-saas/storage/db/schema");
  
  const [patient] = await db
    .insert(patients)
    .values({
      id: data.id || crypto.randomUUID(),
      organizationId: context.organization.id,
      firstName: data.firstName || "Test",
      lastName: data.lastName || "Patient",
      email: data.email || `test-${Date.now()}@example.com`,
      dateOfBirth: new Date("1990-01-01"),
      gender: "other",
    })
    .returning();
  
  return patient;
}

/**
 * Test data factory for organizations
 */
export async function createTestOrganization(
  db: any,
  data: {
    id?: string;
    name?: string;
    region?: "india" | "usa" | "europe" | "dubai";
  } = {}
) {
  const { organizations } = await import("@healthcare-saas/storage/db/schema");
  
  const [org] = await db
    .insert(organizations)
    .values({
      id: data.id || crypto.randomUUID(),
      name: data.name || "Test Organization",
      region: data.region || "usa",
      complianceSettings: {
        hipaa: data.region === "usa",
        gdpr: data.region === "europe",
        ndhm: data.region === "india",
        sharia: data.region === "dubai",
      },
    })
    .returning();
  
  return org;
}
