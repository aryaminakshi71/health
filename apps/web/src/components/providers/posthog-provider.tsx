/**
 * PostHog Analytics Provider
 *
 * Optional analytics integration - gracefully degrades if PostHog is not configured.
 */

import type { ReactNode } from 'react';

// PostHog configuration from environment variables
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined;

export function PostHogProvider({ children }: { children: ReactNode }) {
  // If PostHog is not configured, just render children
  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  // PostHog integration would go here when configured
  // For now, just pass through children
  return <>{children}</>;
}

export function identifyUser(
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    createdAt?: Date | string;
    [key: string]: unknown;
  }
) {
  // PostHog identify would go here
  console.debug('PostHog identify:', userId, properties);
}

export function setOrganization(
  orgId: string,
  properties?: {
    name?: string;
    slug?: string;
    createdAt?: Date | string;
    [key: string]: unknown;
  }
) {
  // PostHog group would go here
  console.debug('PostHog organization:', orgId, properties);
}

export function resetUser() {
  // PostHog reset would go here
  console.debug('PostHog reset');
}
