import { Router } from 'express';
import { createInvoice, getInvoices } from '../controllers/billingController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// All billing routes require authentication
router.use(authMiddleware);

router.post('/invoices', roleMiddleware('ADMIN', 'BILLING'), createInvoice);
router.get('/invoices', getInvoices);

export default router;
