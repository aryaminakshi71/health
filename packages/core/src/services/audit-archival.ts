import { eq, gte, sql } from 'drizzle-orm';
import { db } from '../db';
import { auditLogs } from '../db/schema';
import { encrypt, decrypt } from '../security/encryption';
import { getRedisClient } from '../redis';

const ARCHIVE_AGE_DAYS = 365;
const ARCHIVE_BATCH_SIZE = 10000;

export async function archiveOldAuditLogs() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_AGE_DAYS);

  let archived = 0;
  let hasMore = true;

  while (hasMore) {
    const logs = await db.select()
      .from(auditLogs)
      .where(sql`${auditLogs.createdAt} < ${cutoffDate}`)
      .limit(ARCHIVE_BATCH_SIZE);

    if (logs.length === 0) {
      hasMore = false;
      break;
    }

    for (const log of logs) {
      const encryptedLog = encrypt(JSON.stringify(log), process.env.AUDIT_ENCRYPTION_KEY || 'archive-key');
      
      await db.insert(auditLogsArchive).values({
        originalId: log.id,
        encryptedData: encryptedLog.encrypted,
        iv: encryptedLog.iv,
        tag: encryptedLog.tag,
        salt: encryptedLog.salt,
        originalCreatedAt: log.createdAt,
        archivedAt: new Date(),
      });
    }

    await db.delete(auditLogs)
      .where(sql`${auditLogs.id} IN (${logs.map(l => l.id)})`);

    archived += logs.length;

    if (logs.length < ARCHIVE_BATCH_SIZE) {
      hasMore = false;
    }
  }

  return { archived };
}

export async function cleanupExpiredArchives() {
  const retentionDays = 365 * 7;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const deleted = await db.delete(auditLogsArchive)
    .where(sql`${auditLogsArchive.archivedAt} < ${cutoffDate}`);

  return { deleted };
}

export async function restoreArchivedLog(archiveId: string) {
  const archiveRecord = await db.query.auditLogsArchive.findFirst({
    where: eq(auditLogsArchive.id, archiveId),
  });

  if (!archiveRecord) {
    throw new Error('Archive record not found');
  }

  const decrypted = decrypt({
    encrypted: archiveRecord.encryptedData,
    iv: archiveRecord.iv,
    tag: archiveRecord.tag,
    salt: archiveRecord.salt,
  }, process.env.AUDIT_ENCRYPTION_KEY || 'archive-key');

  const log = JSON.parse(decrypted);

  await db.insert(auditLogs).values(log);

  await db.delete(auditLogsArchive)
    .where(eq(auditLogsArchive.id, archiveId));

  return log;
}

export async function getAuditLogStats() {
  const [totalActive, totalArchived, oldestActive] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(auditLogs),
    db.select({ count: sql<number>`COUNT(*)` }).from(auditLogsArchive),
    db.select({ date: sql<string>`MIN(${auditLogs.createdAt})::TEXT` }).from(auditLogs),
  ]);

  return {
    activeLogs: totalActive[0]?.count || 0,
    archivedLogs: totalArchived[0]?.count || 0,
    oldestActiveLog: oldestActive[0]?.date || null,
  };
}

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const auditLogsArchive = pgTable('audit_logs_archive', {
  id: uuid('id').defaultRandom().primaryKey(),
  originalId: uuid('original_id').notNull(),
  encryptedData: text('encrypted_data').notNull(),
  iv: text('iv').notNull(),
  tag: text('tag').notNull(),
  salt: text('salt').notNull(),
  originalCreatedAt: timestamp('original_created_at').notNull(),
  archivedAt: timestamp('archived_at').defaultNow(),
});
