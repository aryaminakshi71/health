import { eq, and, gte, desc, asc, sql, count } from 'drizzle-orm';
import { db } from '@healthcare-saas/storage';
import { patients, appointments, clinicalNotes, prescriptions, vitalSigns, labResults, charges, complianceAuditLogs } from '@healthcare-saas/storage/db/schema';
import { getOrCache, invalidateCache, invalidateCachePattern, redis } from '@healthcare-saas/storage/redis';

const CACHE_TTL = 300;

async function getCache<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

async function setCache<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  return redis.set(key, value, ttlSeconds);
}

export async function getDashboardMetrics() {
  const cacheKey = 'dashboard:metrics';
  
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const [patientCount, appointmentCount, noteCount, prescriptionCount] = await Promise.all([
    db.select({ count: count() }).from(patients),
    db.select({ count: count() }).from(appointments),
    db.select({ count: count() }).from(clinicalNotes),
    db.select({ count: count() }).from(prescriptions),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAppointments = await db.select({ count: count() })
    .from(appointments)
    .where(gte(appointments.createdAt, today));

  const metrics = {
    totalPatients: patientCount[0]?.count || 0,
    totalAppointments: appointmentCount[0]?.count || 0,
    totalClinicalNotes: noteCount[0]?.count || 0,
    totalPrescriptions: prescriptionCount[0]?.count || 0,
    todayAppointments: todayAppointments[0]?.count || 0,
    lastUpdated: new Date().toISOString(),
  };

  await setCache(cacheKey, metrics, CACHE_TTL);
  
  return metrics;
}

export async function invalidateDashboardCache() {
  await invalidateCache('dashboard:metrics');
}

export async function getPatientStats() {
  const cacheKey = 'patient:stats';
  
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const stats = await db.select({
    total: count(),
    newThisMonth: sql<number>`COUNT(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN 1 END)`,
    active: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
  }).from(patients);

  const result = {
    total: stats[0]?.total || 0,
    newThisMonth: stats[0]?.newThisMonth || 0,
    active: stats[0]?.active || 0,
  };

  await setCache(cacheKey, result, CACHE_TTL);
  
  return result;
}

export async function getRevenueMetrics(startDate?: Date, endDate?: Date) {
  const cacheKey = `revenue:${startDate?.toISOString() || 'all'}:${endDate?.toISOString() || 'now'}`;
  
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const [totalCharges, totalPayments] = await Promise.all([
    db.select({ total: sql<number>`SUM(amount)` }).from(charges),
    db.select({ total: sql<number>`SUM(amount)` }).from(charges),
  ]);

  const metrics = {
    totalCharges: totalCharges[0]?.total || 0,
    totalPayments: totalPayments[0]?.total || 0,
    outstanding: (totalCharges[0]?.total || 0) - (totalPayments[0]?.total || 0),
  };

  await setCache(cacheKey, metrics, CACHE_TTL);
  
  return metrics;
}

export async function getAppointmentTrends(days = 30) {
  const cacheKey = `appointments:trends:${days}`;
  
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const trends = await db.select({
    date: sql<string>`DATE(created_at)::TEXT`,
    count: count(),
  })
  .from(appointments)
  .groupBy(sql`DATE(created_at)`)
  .orderBy(sql`DATE(created_at)`)
  .limit(days);

  await setCache(cacheKey, trends, CACHE_TTL);
  
  return trends;
}

export async function getLabResultsPending() {
  const cacheKey = 'lab:pending';
  
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = await db.select({ count: count() })
    .from(labResults)
    .where(eq(labResults.status, 'pending'));

  await setCache(cacheKey, { count: pending[0]?.count || 0 }, CACHE_TTL);
  
  return { count: pending[0]?.count || 0 };
}

export async function getAuditLogsCount(days = 7) {
  const cacheKey = `audit:count:${days}`;
  
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return cached;
  }

  const date = new Date();
  date.setDate(date.getDate() - days);

  const logs = await db.select({ count: count() })
    .from(complianceAuditLogs)
    .where(gte(complianceAuditLogs.timestamp, date));

  await setCache(cacheKey, { count: logs[0]?.count || 0 }, CACHE_TTL);
  
  return { count: logs[0]?.count || 0 };
}
