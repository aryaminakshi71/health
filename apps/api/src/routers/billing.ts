/**
 * Billing Router
 *
 * Billing and subscription management endpoints.
 */

import { z } from "zod";
import { orgAuthed } from "../procedures";

export const billingRouter = {
  getSubscription: orgAuthed
    .route({
      method: "GET",
      path: "/billing/subscription",
      summary: "Get organization subscription",
      tags: ["Billing"],
    })
    .output(
      z.object({
        plan: z.string(),
        status: z.string(),
      }),
    )
    .handler(async ({ context }) => {
      return {
        plan: context.organization.plan || "free",
        status: "active",
      };
    }),
};
