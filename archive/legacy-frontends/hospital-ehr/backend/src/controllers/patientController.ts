import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Patient, Gender, BloodGroup } from '../models/Patient';
import { z } from 'zod';

const patientRepository = AppDataSource.getRepository(Patient);

// Validation Schema
const createPatientSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().optional(),
    dateOfBirth: z.string(), // ISO Date string
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    phone: z.string().min(10),
    email: z.string().email().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional()
});

export const createPatient = async (req: Request, res: Response) => {
    try {
        const data = createPatientSchema.parse(req.body);

        const mrn = 'MRN-' + Date.now().toString().slice(-8); // Simple MRN generation

        const patient = patientRepository.create({
            ...data,
            dateOfBirth: new Date(data.dateOfBirth),
            gender: data.gender as Gender, // Cast string to Enum
            bloodGroup: data.bloodGroup as BloodGroup, // Cast string to Enum
            mrn
        });

        await patientRepository.save(patient);
        res.status(201).json(patient);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ message: 'Error creating patient' });
    }
};

export const getPatients = async (req: Request, res: Response) => {
    try {
        // Pagination parameters
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
        const skip = (page - 1) * limit;
        
        // Get total count for pagination metadata
        const [patients, total] = await patientRepository.findAndCount({
            order: { createdAt: 'DESC' },
            take: limit,
            skip: skip
        });
        
        res.json({
            data: patients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

export const getPatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const patient = await patientRepository.findOneBy({ id });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient' });
    }
};
