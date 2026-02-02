import handler from "@tanstack/react-start/server-entry";
import type { getRouter } from "./router";

export interface CloudflareRequestContext {
  cloudflare: {
    env: Env;
    ctx: ExecutionContext;
  };
}

declare module "@tanstack/react-start" {
  interface Register {
    ssr: true;
    router: ReturnType<typeof getRouter>;
    server: {
      requestContext: CloudflareRequestContext;
    };
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return handler.fetch(request, {
      context: {
        cloudflare: { env, ctx },
      },
    } as Parameters<typeof handler.fetch>[1]);
  },
};
