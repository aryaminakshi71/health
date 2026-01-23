import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { Hospital } from '../models/Hospital';
import { z } from 'zod';

const userRepository = AppDataSource.getRepository(User);
const hospitalRepository = AppDataSource.getRepository(Hospital);

const registerHospitalSchema = z.object({
    hospitalName: z.string().min(2),
    adminEmail: z.string().email(),
    password: z.string().min(6),
    adminName: z.string().min(2)
});

export const registerHospital = async (req: Request, res: Response) => {
    try {
        const { hospitalName, adminEmail, password, adminName } = registerHospitalSchema.parse(req.body);

        // 1. Check if user already exists (globally unique email for simplicity)
        const existingUser = await userRepository.findOneBy({ email: adminEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Create Hospital
        const hospital = hospitalRepository.create({
            name: hospitalName,
            domain: hospitalName.toLowerCase().replace(/\s+/g, '-') + '.ehr.com',
            subscriptionPlan: 'FREE'
        });
        await hospitalRepository.save(hospital);

        // 3. Create Admin User linked to Hospital
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
            role: UserRole.ADMIN,
            hospitalId: hospital.id
        });
        await userRepository.save(user);

        // 4. Generate Token
        const token = jwt.sign(
            { userId: user.id, role: user.role, hospitalId: hospital.id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Hospital registered successfully',
            hospital: { id: hospital.id, name: hospital.name, domain: hospital.domain },
            token
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
