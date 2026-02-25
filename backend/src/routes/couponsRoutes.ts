import { Router } from 'express';
import { validateCoupon } from '../controllers/couponsController.js';

const router = Router();

router.post('/validate', validateCoupon);

export default router;
