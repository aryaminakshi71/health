import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { ANCVisit } from '../models/ANCVisit';
import { TherapySession, TherapyType } from '../models/TherapySession';
import { z } from 'zod';

const ancRepository = AppDataSource.getRepository(ANCVisit);
const therapyRepository = AppDataSource.getRepository(TherapySession);

// --- Maternal Health (Suraksha) ---
const createANCVisitSchema = z.object({
    patientId: z.string().uuid(),
    trimester: z.number().min(1).max(3),
    weight: z.number().optional(),
    bp: z.string().optional(),
    hemoglobin: z.number().optional(),
    isHighRisk: z.boolean().optional(),
    notes: z.string().optional()
});

export const createANCVisit = async (req: Request, res: Response) => {
    try {
        const data = createANCVisitSchema.parse(req.body);
        const visit = ancRepository.create(data);
        await ancRepository.save(visit);
        res.status(201).json(visit);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error creating ANC visit' });
    }
};

export const getANCVisits = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.query;
        const where: any = {};
        if (patientId && typeof patientId === 'string') {
            where.patientId = patientId;
        }
        const visits = await ancRepository.find({ where, relations: ['patient'], order: { createdAt: 'DESC' } });
        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ANC visits' });
    }
};

// --- Autism Care ---
const createTherapySchema = z.object({
    patientId: z.string().uuid(),
    type: z.nativeEnum(TherapyType),
    activitiesPerformed: z.string(),
    progressNotes: z.string().optional()
});

export const createTherapySession = async (req: Request, res: Response) => {
    try {
        const data = createTherapySchema.parse(req.body);
        const session = therapyRepository.create({
            ...data,
            type: data.type as TherapyType // Explicit cast
        });
        await therapyRepository.save(session);
        res.status(201).json(session);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
        res.status(500).json({ message: 'Error creating Therapy session' });
    }
};

export const getTherapySessions = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.query;
        const where: any = {};
        if (patientId && typeof patientId === 'string') {
            where.patientId = patientId;
        }

        const sessions = await therapyRepository.find({ where, relations: ['patient'], order: { createdAt: 'DESC' } });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Therapy sessions' });
    }
};
