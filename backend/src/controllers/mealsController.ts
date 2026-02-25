import { Meal } from '../models/Meal.js';

export const getMeals = async (req: any, res: any) => {
  try {
    const weekParam = Number(req.query.week);
    const filters: any = { available: true };
    if (Number.isFinite(weekParam) && weekParam > 0) {
      filters.week = weekParam;
    }
    const meals = await Meal.find(filters);
    res.json(meals);
  } catch {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};
