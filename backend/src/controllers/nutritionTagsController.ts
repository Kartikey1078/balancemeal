import { NutritionTag } from '../models/NutritionTag.js';

export const getNutritionTags = async (_req: any, res: any) => {
  try {
    const tags = await NutritionTag.find({ active: true }).sort('name');
    res.json(tags);
  } catch {
    res.status(500).json({ error: 'Failed to fetch nutrition tags' });
  }
};
