/**
 * oRPC Procedures
 * 
 * Defines the middleware patterns for type-safe API procedures:
 * - pub: Public procedures (no authentication)
 * - authed: Authenticated user procedures
 * - orgAuthed: Organization-scoped procedures
 * - complianceAudited: Region-specific compliance logging
 */

import { os } from '@orpc/server';
import { ORPCError } from '@orpc/server';
import * as schema from '@healthcare-saas/storage/db/schema';
import { createAuthFromEnv } from './lib/create-auth-from-env';
import { createDb } from './lib/create-db';

// Context types
type PublicContext = {
  headers: Headers;
  request?: Request;
};

type AuthedContext = PublicContext & {
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string | null;
    role: string;
  };
};

type OrgAuthedContext = AuthedContext & {
  organization: {
    id: string;
    name: string;
    region: 'india' | 'usa' | 'europe' | 'dubai';
    complianceSettings: {
      hipaa: boolean;
      gdpr: boolean;
      ndhm: boolean;
      sharia: boolean;
    };
  };
};

// Database connection helper with connection pooling
// Supports Hyperdrive (Cloudflare Workers) or direct PostgreSQL connection
export function getDb(context: AuthedContext | OrgAuthedContext | PublicContext) {
  // Check for Hyperdrive connection string from Cloudflare env
  // In Cloudflare Workers, env.DATABASE.connectionString is provided by Hyperdrive
  const connectionString = 
    (context as any).env?.DATABASE?.connectionString ||
    process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  
  return createDb({ connectionString });
}

// Export schema for use in routers
export { schema };

/**
 * Public Procedure
 * No authentication required
 */
export const pub = os.$context<PublicContext>();

/**
 * Authenticated Procedure
 * Requires valid user session
 */
export const authed = pub.use(async (ctx, next) => {
  // Better Auth integration - verify session from cookie or Authorization header
  const authHeader = ctx.headers.get('authorization');
  const cookieHeader = ctx.headers.get('cookie');
  
  let sessionToken: string | null = null;
  
  // Try to get token from Authorization header first
  if (authHeader?.startsWith('Bearer ')) {
    sessionToken = authHeader.replace('Bearer ', '');
  } 
  // Fall back to cookie
  else if (cookieHeader) {
    const cookies = cookieHeader.split('; ').reduce((acc: Record<string, string>, cookie: string) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    sessionToken = cookies['better-auth.session_token'] || null;
  }
  
  if (!sessionToken) {
    throw new ORPCError({
      code: 'UNAUTHORIZED' as any,
      message: 'Authentication required',
    });
  }

  // Verify session with Better Auth
  const user = await verifyAuthToken(sessionToken);
  
  if (!user) {
    throw new ORPCError({
      code: 'UNAUTHORIZED' as any,
      message: 'Invalid authentication token',
    });
  }

  return next({
    ...ctx,
    user,
  } as any);
});

/**
 * Organization-Authenticated Procedure
 * Requires authentication AND organization membership
 */
export const orgAuthed = authed.use(async (ctx, next) => {
  if (!ctx.user.organizationId) {
    throw new ORPCError({
      code: 'FORBIDDEN',
      message: 'User must be associated with an organization',
    });
  }

  // Fetch organization details
  const db = getDb(ctx);
  const org = await db.query.organizations.findFirst({
    where: (organizations, { eq }) => eq(organizations.id, ctx.user.organizationId!),
  });

  if (!org) {
    throw new ORPCError('FORBIDDEN' as any, {
      message: 'Organization not found',
    });
  }

  // Get compliance settings for the organization
  const complianceSettings = await getComplianceSettings(org.region);

  return next({
    ...ctx,
    organization: {
      id: org.id,
      name: org.name,
      region: org.region as 'india' | 'usa' | 'europe' | 'dubai',
      complianceSettings,
    },
  } as any);
});

/**
 * Compliance-Audited Procedure
 * Adds region-specific audit logging
 */
export const complianceAudited = orgAuthed.use(async (ctx, next) => {
  const startTime = Date.now();
  const result = await next(ctx as any);
  const duration = Date.now() - startTime;

  // Log to audit trail based on region
  await logComplianceAudit({
    userId: ctx.user.id,
    organizationId: ctx.organization.id,
    region: ctx.organization.region,
    action: 'unknown', // oRPC doesn't expose route in context
    method: 'unknown',
    timestamp: new Date(),
    duration,
    ipAddress: ctx.headers.get('x-forwarded-for') || 'unknown',
  });

  return result;
});

// Helper functions (to be implemented)

async function verifyAuthToken(token: string): Promise<AuthedContext['user'] | null> {
  try {
    // Create a request-like object for Better Auth
    const headers = new Headers({
      'cookie': `better-auth.session_token=${token}`,
    });

    // Get database connection
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return null;
    }
    const db = createDb({ connectionString });
    
    // Create auth instance
    const auth = createAuthFromEnv(db, {
      DATABASE_URL: connectionString,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      VITE_PUBLIC_SITE_URL: process.env.VITE_PUBLIC_SITE_URL,
    });

    // Verify session with Better Auth
    const session = await auth.api.getSession({
      headers,
    });

    if (!session?.user) {
      return null;
    }

    // Return user information from Better Auth session
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || session.user.email?.split('@')[0] || '',
      organizationId: (session.user as any).organizationId || null,
      role: (session.user as any).role || 'user',
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

async function getComplianceSettings(region: string) {
  // Return compliance settings based on region
  const defaults = {
    hipaa: false,
    gdpr: false,
    ndhm: false,
    sharia: false,
  };

  switch (region) {
    case 'usa':
      return { ...defaults, hipaa: true };
    case 'europe':
      return { ...defaults, gdpr: true };
    case 'india':
      return { ...defaults, ndhm: true };
    case 'dubai':
      return { ...defaults, sharia: true };
    default:
      return defaults;
  }
}

async function logComplianceAudit(data: {
  userId: string;
  organizationId: string;
  region: string;
  action: string;
  method: string;
  timestamp: Date;
  duration: number;
  ipAddress: string;
}) {
  try {
    const db = getDb({ headers: new Headers() } as PublicContext);
    
    // Determine if PHI was accessed based on action
    const phiAccessed = data.action.includes('patient') || 
                       data.action.includes('ehr') || 
                       data.action.includes('medical');
    
    // Determine compliance flags based on region
    const hipaaCompliant = data.region === 'usa';
    const gdprCompliant = data.region === 'europe';
    
    await db.insert(schema.complianceAuditLogs).values({
      organizationId: data.organizationId,
      region: data.region as 'india' | 'usa' | 'europe' | 'dubai',
      userId: data.userId,
      action: data.action as any,
      method: data.method as any,
      path: data.action,
      ipAddress: data.ipAddress,
      statusCode: 200,
      duration: data.duration,
      success: true,
      phiAccessed,
      hipaaCompliant,
      gdprCompliant,
      timestamp: data.timestamp,
    });
  } catch (error) {
    // Don't fail the request if audit logging fails, but log the error
    console.error('Failed to log compliance audit:', error);
  }
}
