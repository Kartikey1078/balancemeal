import { Recipe } from '../models/Recipe.js';

export const getRecipes = async (_req: any, res: any) => {
  try {
    const recipes = await Recipe.find({
      status: 'Published',
      isDeleted: false,
    }).sort('-createdAt');
    res.json(recipes);
  } catch {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

export const getRecipeById = async (req: any, res: any) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      status: 'Published',
      isDeleted: false,
    });
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json(recipe);
  } catch {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
};
