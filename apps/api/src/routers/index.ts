/**
 * App Router
 *
 * Composed router with all domain routers.
 * Split into separate files to avoid TypeScript TS7056 limits.
 */

import { healthRouter } from "./health";
import { userRouter } from "./user";
import { billingRouter } from "./billing";
import { notesRouter } from "./notes";
import { ticketsRouter } from "./tickets";
import { dashboardRouter } from "./dashboard";
import { kbRouter } from "./kb";
import { filesRouter } from "./files";
import { patientsRouter } from "./patients";
import { appointmentsRouter } from "./appointments";
import { ehrRouter } from "./ehr";
import { prescriptionsRouter } from "./prescriptions";
import { billingRouter as billingHealthcareRouter } from "./billing-healthcare";
import { labRouter } from "./lab";
import { pharmacyRouter } from "./pharmacy";
import { complianceRouter } from "./compliance";
import { claimsRouter } from "./claims";
import { telemedicineRouter } from "./telemedicine";
import { analyticsRouter } from "./analytics";

export const appRouter = {
  health: healthRouter,
  user: userRouter,
  billing: billingRouter,
  notes: notesRouter,
  tickets: ticketsRouter,
  dashboard: dashboardRouter,
  kb: kbRouter,
  files: filesRouter,
  // Healthcare routers
  patients: patientsRouter,
  appointments: appointmentsRouter,
  ehr: ehrRouter,
  prescriptions: prescriptionsRouter,
  billingHealthcare: billingHealthcareRouter,
  lab: labRouter,
  pharmacy: pharmacyRouter,
  compliance: complianceRouter,
  claims: claimsRouter,
  telemedicine: telemedicineRouter,
  analytics: analyticsRouter,
};

export type AppRouter = typeof appRouter;
