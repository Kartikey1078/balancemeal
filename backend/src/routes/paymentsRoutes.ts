import { Router } from 'express';
import { processPayment } from '../controllers/paymentsController.js';

const router = Router();

router.post('/process', processPayment);

export default router;
