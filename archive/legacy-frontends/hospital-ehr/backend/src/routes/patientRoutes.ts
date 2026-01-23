import { Router } from 'express';
import { createPatient, getPatients, getPatientById } from '../controllers/patientController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All patient routes require authentication
router.use(authMiddleware);

// Retrieve all patients - requires authenticated user
router.get('/', getPatients);

// Create a new patient - requires DOCTOR, ADMIN, or RECEPTIONIST role
router.post('/', roleMiddleware('ADMIN', 'DOCTOR', 'RECEPTIONIST'), createPatient);

// Get single patient - requires authenticated user
router.get('/:id', getPatientById);

export default router;
