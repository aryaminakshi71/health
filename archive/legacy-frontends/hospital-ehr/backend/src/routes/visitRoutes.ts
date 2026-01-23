import { Router } from 'express';
import { createVisit, getVisits, updateVisit } from '../controllers/visitController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All visit routes require authentication
router.use(authMiddleware);

router.get('/', getVisits);
router.post('/', roleMiddleware('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'), createVisit);
router.patch('/:id', roleMiddleware('ADMIN', 'DOCTOR', 'NURSE'), updateVisit);

export default router;
