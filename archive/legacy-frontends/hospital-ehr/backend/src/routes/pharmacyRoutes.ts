import { Router } from 'express';
import { addMedicine, getInventory, dispenseMedicine } from '../controllers/pharmacyController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All pharmacy routes require authentication
router.use(authMiddleware);

router.post('/inventory', roleMiddleware('ADMIN', 'PHARMACIST'), addMedicine);
router.get('/inventory', getInventory);
router.post('/dispense', roleMiddleware('ADMIN', 'PHARMACIST', 'DOCTOR'), dispenseMedicine);

export default router;
