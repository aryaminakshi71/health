import { Router } from 'express';
import { createBed, getBeds, admitPatient, dischargePatient } from '../controllers/ipdController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All IPD routes require authentication
router.use(authMiddleware);

// Bed Management
router.post('/beds', roleMiddleware('ADMIN'), createBed);
router.get('/beds', getBeds);

// Admissions - require DOCTOR or ADMIN role
router.post('/admit', roleMiddleware('ADMIN', 'DOCTOR'), admitPatient);
router.post('/discharge', roleMiddleware('ADMIN', 'DOCTOR'), dischargePatient);

export default router;
