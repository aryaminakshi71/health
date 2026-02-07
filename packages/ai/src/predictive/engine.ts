import { db } from '@healthcare-saas/storage';
import { appointments, patients, labResults } from '@healthcare-saas/storage/db/schema';
import { and, gte, desc, sql, eq } from 'drizzle-orm';

export interface RiskAssessment {
  patientId: string;
  readmissionRisk: RiskScore;
  noShowRisk: RiskScore;
  chronicDiseaseRisk: ChronicRisk[];
  recommendations: string[];
}

export interface RiskScore {
  level: 'low' | 'moderate' | 'high' | 'very_high';
  percentage: number;
  factors: string[];
}

export interface ChronicRisk {
  condition: string;
  probability: number;
  icdCode: string;
  category: 'cardiovascular' | 'metabolic' | 'respiratory' | 'other';
}

export interface ReadmissionFactors {
  previousReadmissions: number;
  recentHospitalizations: number;
  chronicConditions: number;
  medicationAdherence: number;
  socialSupport: number;
  age: number;
  recentLabAbnormalities: number;
}

export interface NoShowFactors {
  appointmentHistory: number;
  noShowHistory: number;
  distanceToFacility: number;
  waitTime: number;
  dayOfWeek: string;
  timeOfDay: string;
}

export class RiskPredictionEngine {
  async assessReadmissionRisk(patientId: string): Promise<RiskScore> {
    const [patient, recentHospitalizations, chronicConditionsCount] = await Promise.all([
      db.query.patients.findFirst({ where: eq(patients.id, patientId) }),
      db.select({ count: sql<number>`count(*)` }).from(appointments)
        .where(and(
          eq(appointments.patientId, patientId),
          gte(appointments.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
        )),
      db.select({ count: sql<number>`count(*)` }).from(appointments)
        .where(and(
          eq(appointments.patientId, patientId),
          gte(appointments.scheduledAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        )),
    ]);

    const factors: string[] = [];
    let riskScore = 0;

    const age = patient?.createdAt ? 
      Math.floor((Date.now() - patient.createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

    if (recentHospitalizations[0]?.count > 2) {
      riskScore += 25;
      factors.push('Multiple recent hospitalizations');
    }

    if (age > 65) {
      riskScore += 15;
      factors.push('Elderly patient');
    }

    if (chronicConditionsCount[0]?.count > 3) {
      riskScore += 20;
      factors.push('Multiple chronic conditions');
    }

    let level: RiskScore['level'];
    if (riskScore >= 50) level = 'very_high';
    else if (riskScore >= 35) level = 'high';
    else if (riskScore >= 20) level = 'moderate';
    else level = 'low';

    return {
      level,
      percentage: Math.min(95, riskScore + 15),
      factors,
    };
  }

  async assessNoShowRisk(patientId: string, appointmentDate: Date): Promise<RiskScore> {
    const [appointmentHistory, noShowHistory] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(appointments)
        .where(eq(appointments.patientId, patientId)),
      db.select({ count: sql<number>`count(*)` }).from(appointments)
        .where(and(
          eq(appointments.patientId, patientId),
          eq(appointments.status, 'no_show')
        )),
    ]);

    const factors: string[] = [];
    let riskScore = 0;

    const totalAppointments = appointmentHistory[0]?.count || 0;
    const noShows = noShowHistory[0]?.count || 0;

    if (totalAppointments > 0) {
      const noShowRate = noShows / totalAppointments;
      
      if (noShowRate > 0.3) {
        riskScore += 40;
        factors.push('High historical no-show rate');
      } else if (noShowRate > 0.15) {
        riskScore += 20;
        factors.push('Moderate historical no-show rate');
      }
    } else {
      riskScore += 15;
      factors.push('No appointment history');
    }

    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayOfWeek === 'Monday') {
      riskScore += 10;
      factors.push('Monday appointments have higher no-show rates');
    }

    const hour = appointmentDate.getHours();
    if (hour < 9 || hour > 16) {
      riskScore += 5;
      factors.push('Early morning or late afternoon appointments');
    }

    let level: RiskScore['level'];
    if (riskScore >= 50) level = 'very_high';
    else if (riskScore >= 35) level = 'high';
    else if (riskScore >= 20) level = 'moderate';
    else level = 'low';

    return {
      level,
      percentage: Math.min(80, riskScore + 10),
      factors,
    };
  }

  async assessChronicDiseaseRisk(patientId: string): Promise<ChronicRisk[]> {
    const risks: ChronicRisk[] = [
      {
        condition: 'Type 2 Diabetes',
        probability: 0.12,
        icdCode: 'E11.9',
        category: 'metabolic',
      },
      {
        condition: 'Hypertension',
        probability: 0.25,
        icd10: 'I10',
        category: 'cardiovascular',
      },
      {
        condition: 'Coronary Artery Disease',
        probability: 0.08,
        icdCode: 'I25.10',
        category: 'cardiovascular',
      },
      {
        condition: 'Chronic Obstructive Pulmonary Disease',
        probability: 0.06,
        icdCode: 'J44.9',
        category: 'respiratory',
      },
      {
        condition: 'Asthma',
        probability: 0.10,
        icdCode: 'J45.909',
        category: 'respiratory',
      },
    ];

    return risks.sort((a, b) => b.probability - a.probability).slice(0, 5);
  }

  async generateRecommendations(patientId: string): Promise<string[]> {
    const [readmissionRisk, chronicRisks] = await Promise.all([
      this.assessReadmissionRisk(patientId),
      this.assessChronicDiseaseRisk(patientId),
    ]);

    const recommendations: string[] = [];

    if (readmissionRisk.level === 'high' || readmissionRisk.level === 'very_high') {
      recommendations.push('Schedule follow-up appointment within 7 days of discharge');
      recommendations.push('Implement medication reconciliation process');
      recommendations.push('Arrange home health services if needed');
      recommendations.push('Provide patient education on warning signs');
    }

    if (chronicRisks.some(r => r.category === 'cardiovascular' && r.probability > 0.2)) {
      recommendations.push('Consider cardiovascular risk assessment');
      recommendations.push('Review blood pressure and cholesterol levels');
      recommendations.push('Discuss lifestyle modifications');
    }

    if (chronicRisks.some(r => r.category === 'metabolic' && r.probability > 0.15)) {
      recommendations.push('Screen for diabetes if not already diagnosed');
      recommendations.push('Review diet and exercise habits');
      recommendations.push('Consider metabolic health panel');
    }

    recommendations.push('Schedule regular preventive care visits');

    return recommendations;
  }

  async assessPatient(patientId: string): Promise<RiskAssessment> {
    const [readmissionRisk, noShowRisk, chronicDiseaseRisk, recommendations] = await Promise.all([
      this.assessReadmissionRisk(patientId),
      this.assessNoShowRisk(patientId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      this.assessChronicDiseaseRisk(patientId),
      this.generateRecommendations(patientId),
    ]);

    return {
      patientId,
      readmissionRisk,
      noShowRisk,
      chronicDiseaseRisk,
      recommendations,
    };
  }
}

export const riskEngine = new RiskPredictionEngine();

export async function getRiskAssessment(patientId: string): Promise<RiskAssessment> {
  return riskEngine.assessPatient(patientId);
}
