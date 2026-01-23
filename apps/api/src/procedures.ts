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
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@healthcare-saas/storage/db/schema';
import { auth } from '@healthcare-saas/core/auth/better-auth';

// Context types
type PublicContext = {
  request: Request;
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
export function getDb(context: AuthedContext | OrgAuthedContext) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  
  // Connection pooling configuration
  // Max 20 connections per app instance
  const client = postgres(connectionString, {
    max: 20,                    // Max connections
    idle_timeout: 20,           // 20 seconds
    connect_timeout: 10,        // 10 seconds
    ssl: "require",            // Required for Neon/Cloud providers
  });
  
  return drizzle(client, { schema });
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
  const authHeader = ctx.request.headers.get('authorization');
  const cookieHeader = ctx.request.headers.get('cookie');
  
  let sessionToken: string | null = null;
  
  // Try to get token from Authorization header first
  if (authHeader?.startsWith('Bearer ')) {
    sessionToken = authHeader.replace('Bearer ', '');
  } 
  // Fall back to cookie
  else if (cookieHeader) {
    const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    sessionToken = cookies['better-auth.session_token'] || null;
  }
  
  if (!sessionToken) {
    throw new ORPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }

  // Verify session with Better Auth
  const user = await verifyAuthToken(sessionToken);
  
  if (!user) {
    throw new ORPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid authentication token',
    });
  }

  return next({
    ...ctx,
    user,
  });
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
    throw new ORPCError({
      code: 'FORBIDDEN',
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
  });
});

/**
 * Compliance-Audited Procedure
 * Adds region-specific audit logging
 */
export const complianceAudited = orgAuthed.use(async (ctx, next) => {
  const startTime = Date.now();
  const result = await next();
  const duration = Date.now() - startTime;

  // Log to audit trail based on region
  await logComplianceAudit({
    userId: ctx.user.id,
    organizationId: ctx.organization.id,
    region: ctx.organization.region,
    action: ctx.route?.path || 'unknown',
    method: ctx.route?.method || 'unknown',
    timestamp: new Date(),
    duration,
    ipAddress: ctx.request.headers.get('x-forwarded-for') || 'unknown',
  });

  return result;
});

// Helper functions (to be implemented)

async function verifyAuthToken(token: string): Promise<AuthedContext['user'] | null> {
  try {
    // Create a request-like object for Better Auth
    const request = new Request('http://localhost', {
      headers: {
        'cookie': `better-auth.session_token=${token}`,
      },
    });

    // Verify session with Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
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
    const db = getDb({ request: new Request('http://localhost') } as PublicContext);
    
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
