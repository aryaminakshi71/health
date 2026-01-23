import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Bed, BedStatus } from '../models/Bed';
import { Admission, AdmissionStatus } from '../models/Admission';
import { z } from 'zod';

const bedRepository = AppDataSource.getRepository(Bed);
const admissionRepository = AppDataSource.getRepository(Admission);

// --- Bed Management ---
export const createBed = async (req: Request, res: Response) => {
    try {
        const bed = bedRepository.create(req.body);
        await bedRepository.save(bed);
        res.status(201).json(bed);
    } catch (error) {
        res.status(500).json({ message: 'Error creating bed' });
    }
};

export const getBeds = async (req: Request, res: Response) => {
    try {
        const beds = await bedRepository.find({
            order: { wardName: 'ASC', roomNumber: 'ASC', bedNumber: 'ASC' }
        });
        res.json(beds);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching beds' });
    }
};

// --- Admission ---
const admitPatientSchema = z.object({
    patientId: z.string().uuid(),
    bedId: z.string().uuid(),
    reasonForAdmission: z.string().optional()
});

export const admitPatient = async (req: Request, res: Response) => {
    try {
        const { patientId, bedId, reasonForAdmission } = admitPatientSchema.parse(req.body);

        // 1. Check bed availability
        const bed = await bedRepository.findOneBy({ id: bedId });
        if (!bed) return res.status(404).json({ message: 'Bed not found' });
        if (bed.status !== BedStatus.AVAILABLE) {
            return res.status(400).json({ message: 'Bed is not available' });
        }

        // 2. Create Admission Record
        const admission = admissionRepository.create({
            patientId,
            bedId,
            reasonForAdmission,
            status: AdmissionStatus.ADMITTED,
            admissionDate: new Date()
        });
        await admissionRepository.save(admission);

        // 3. Update Bed Status
        bed.status = BedStatus.OCCUPIED;
        bed.currentAdmissionId = admission.id;
        await bedRepository.save(bed);

        res.status(201).json(admission);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Error admitting patient' });
    }
};

export const dischargePatient = async (req: Request, res: Response) => {
    try {
        const { admissionId } = req.body;

        const admission = await admissionRepository.findOneBy({ id: admissionId });
        if (!admission || admission.status !== AdmissionStatus.ADMITTED) {
            return res.status(400).json({ message: 'Invalid admission' });
        }

        // 1. Update Admission
        admission.status = AdmissionStatus.DISCHARGED;
        admission.dischargeDate = new Date();
        await admissionRepository.save(admission);

        // 2. Free the Bed
        const bed = await bedRepository.findOneBy({ id: admission.bedId });
        if (bed) {
            bed.status = BedStatus.CLEANING; // Mark for cleaning first
            bed.currentAdmissionId = ''; // Clear association
            await bedRepository.save(bed);
        }

        res.json({ message: 'Patient discharged successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error discharging patient' });
    }
};
