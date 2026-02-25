import { Router } from 'express';
import { getMeals } from '../controllers/mealsController.js';

const router = Router();

router.get('/', getMeals);

export default router;
