/**
 * Test Utilities for Health App
 * 
 * Simplified test utilities for oRPC routers
 */

/**
 * Create mock logger for tests
 */
export function createMockLogger() {
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
export function createMockOrgContext(overrides: Record<string, unknown> = {}) {
  return {
    headers: new Headers(overrides.headers as HeadersInit || {}),
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
      region: "usa",
    },
  };
}
