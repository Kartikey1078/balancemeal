import { Router } from 'express';
import { getNutritionTags } from '../controllers/nutritionTagsController.js';

const router = Router();

router.get('/', getNutritionTags);

export default router;
