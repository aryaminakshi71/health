import { Router } from 'express';
import { createANCVisit, getANCVisits, createTherapySession, getTherapySessions } from '../controllers/specialtyController';

const router = Router();

// Maternal Health
router.post('/maternal/anc', createANCVisit);
router.get('/maternal/anc', getANCVisits);

// Autism Care
router.post('/autism/therapy', createTherapySession);
router.get('/autism/therapy', getTherapySessions);

export default router;
