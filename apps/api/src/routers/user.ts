/**
 * User Router
 *
 * User profile and settings endpoints.
 */

import { z } from "zod";
import { authed } from "../procedures";

export const userRouter = {
  me: authed
    .route({
      method: "GET",
      path: "/user/me",
      summary: "Get current user",
      tags: ["User"],
    })
    .output(
      z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        image: z.string().nullable().optional(),
      }),
    )
    .handler(async ({ context }) => {
      return {
        id: context.user.id,
        email: context.user.email,
        name: context.user.name,
        image: context.user.image,
      };
    }),
};
