import { db } from '@healthcare-saas/storage';
import { vitalSigns } from '@healthcare-saas/storage/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface VitalSignData {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  timestamp: Date;
}

export interface VitalSignSyncResult {
  success: boolean;
  syncedCount: number;
  lastSyncTime: Date;
  errors: string[];
}

export class WearableSyncService {
  private static instance: WearableSyncService;

  private constructor() {}

  static getInstance(): WearableSyncService {
    if (!WearableSyncService.instance) {
      WearableSyncService.instance = new WearableSyncService();
    }
    return WearableSyncService.instance;
  }

  async syncFromDevice(patientId: string, deviceData: VitalSignData[]): Promise<VitalSignSyncResult> {
    const errors: string[] = [];
    let syncedCount = 0;

    for (const data of deviceData) {
      try {
        await db.insert(vitalSigns).values({
          patientId,
          bloodPressureSystolic: data.bloodPressureSystolic,
          bloodPressureDiastolic: data.bloodPressureDiastolic,
          heartRate: data.heartRate,
          temperature: data.temperature ? String(data.temperature) : undefined,
          respiratoryRate: data.respiratoryRate,
          oxygenSaturation: data.oxygenSaturation,
          weight: data.weight ? String(data.weight) : undefined,
          recordedAt: data.timestamp || new Date(),
          createdAt: new Date(),
        });
        syncedCount++;
      } catch (error) {
        errors.push(`Failed to sync vital sign: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      syncedCount,
      lastSyncTime: new Date(),
      errors,
    };
  }

  async getLatestVitals(patientId: string): Promise<VitalSignData | null> {
    const latest = await db.select()
      .from(vitalSigns)
      .where(eq(vitalSigns.patientId, patientId))
      .orderBy(desc(vitalSigns.recordedAt))
      .limit(1);

    if (latest.length === 0) return null;

    const v = latest[0];
    return {
      bloodPressureSystolic: v.bloodPressureSystolic || undefined,
      bloodPressureDiastolic: v.bloodPressureDiastolic || undefined,
      heartRate: v.heartRate || undefined,
      temperature: v.temperature ? parseFloat(v.temperature) : undefined,
      respiratoryRate: v.respiratoryRate || undefined,
      oxygenSaturation: v.oxygenSaturation || undefined,
      weight: v.weight ? parseFloat(v.weight) : undefined,
      timestamp: v.recordedAt || new Date(),
    };
  }

  async getVitalsTrend(patientId: string, days: number = 7): Promise<VitalSignData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await db.select()
      .from(vitalSigns)
      .where(eq(vitalSigns.patientId, patientId))
      .orderBy(desc(vitalSigns.recordedAt));

    return records.map(v => ({
      bloodPressureSystolic: v.bloodPressureSystolic || undefined,
      bloodPressureDiastolic: v.bloodPressureDiastolic || undefined,
      heartRate: v.heartRate || undefined,
      temperature: v.temperature ? parseFloat(v.temperature) : undefined,
      respiratoryRate: v.respiratoryRate || undefined,
      oxygenSaturation: v.oxygenSaturation || undefined,
      weight: v.weight ? parseFloat(v.weight) : undefined,
      timestamp: v.recordedAt || new Date(),
    }));
  }
}

export const wearableSync = WearableSyncService.getInstance();
