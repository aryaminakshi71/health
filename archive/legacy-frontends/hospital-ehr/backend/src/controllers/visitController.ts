import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Visit, VisitStatus, VisitType } from '../models/Visit';
import { z } from 'zod';

const visitRepository = AppDataSource.getRepository(Visit);

const createVisitSchema = z.object({
    patientId: z.string().uuid(),
    doctorId: z.string().uuid().optional(),
    type: z.nativeEnum(VisitType).optional(),
    chiefComplaint: z.string().optional()
});

export const createVisit = async (req: Request, res: Response) => {
    try {
        const data = createVisitSchema.parse(req.body);

        const visit = visitRepository.create({
            ...data,
            status: VisitStatus.WAITING, // Default to waiting queue
            visitDate: new Date()
        });

        await visitRepository.save(visit);
        res.status(201).json(visit);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating visit' });
    }
};

export const getVisits = async (req: Request, res: Response) => {
    try {
        const { status, patientId, doctorId } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (patientId) where.patientId = patientId;
        if (doctorId) where.doctorId = doctorId;

        const visits = await visitRepository.find({
            where,
            relations: ['patient', 'doctor'],
            order: { visitDate: 'DESC' }
        });

        // SMART QUEUE LOGIC: Calculate Estimated Wait Time
        const enrichedVisits = visits.map((visit, index) => {
            // Simple logic: If status is WAITING, wait time = index * 15 mins
            const waitTime = visit.status === VisitStatus.WAITING ? (index * 15) : 0;
            return { ...visit, estimatedWaitTime: waitTime };
        });

        res.json(enrichedVisits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching visits' });
    }
};

export const updateVisit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, diagnosis, notes, vitals } = req.body;

        const visit = await visitRepository.findOneBy({ id });
        if (!visit) return res.status(404).json({ message: 'Visit not found' });

        if (status) visit.status = status;
        if (diagnosis) visit.diagnosis = diagnosis;
        if (notes) visit.notes = notes;
        if (vitals) visit.vitals = vitals;

        await visitRepository.save(visit);
        res.json(visit);
    } catch (error) {
        res.status(500).json({ message: 'Error updating visit' });
    }
};
