import { Router } from 'express';
import { registerHospital } from '../controllers/saasController';

const router = Router();

router.post('/register', registerHospital);

export default router;
