import { MasterRecipe } from '../models/MasterRecipe.js';

export const getMasterRecipes = async (_req: any, res: any) => {
  const recipes = await MasterRecipe.find().sort('-createdAt');
  res.json({ recipes });
};

export const createMasterRecipe = async (req: any, res: any) => {
  const { name, baseServings, desiredServings, ingredients } = req.body || {};
  if (!name || !baseServings || !desiredServings) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const recipe = await MasterRecipe.create({
    name,
    baseServings: Number(baseServings),
    desiredServings: Number(desiredServings),
    ingredients: Array.isArray(ingredients) ? ingredients : [],
  });
  res.status(201).json(recipe);
};

export const updateMasterRecipe = async (req: any, res: any) => {
  const updates: any = {};
  if (req.body?.name !== undefined) updates.name = req.body.name;
  if (req.body?.baseServings !== undefined) {
    updates.baseServings = Number(req.body.baseServings);
  }
  if (req.body?.desiredServings !== undefined) {
    updates.desiredServings = Number(req.body.desiredServings);
  }
  if (req.body?.ingredients !== undefined) {
    updates.ingredients = Array.isArray(req.body.ingredients)
      ? req.body.ingredients
      : [];
  }
  const updated = await MasterRecipe.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  if (!updated) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  return res.json(updated);
};

export const deleteMasterRecipe = async (req: any, res: any) => {
  await MasterRecipe.findByIdAndDelete(req.params.id);
  return res.status(204).send();
};
