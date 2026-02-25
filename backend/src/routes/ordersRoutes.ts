import { Router } from 'express';
import { getMyOrders } from '../controllers/ordersController.js';
import { userAuth } from '../middleware/userAuth.js';

const router = Router();

router.get('/mine', userAuth, getMyOrders);

export default router;
