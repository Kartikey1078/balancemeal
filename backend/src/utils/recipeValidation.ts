export const validateRecipePayload = (payload: any) => {
  const errors: string[] = [];
  const requiredFields = [
    'title',
    'image',
    'category',
    'prepTime',
    'cookTime',
    'difficulty',
    'servings',
  ];
  requiredFields.forEach((field) => {
    if (!payload[field]) errors.push(`${field} is required`);
  });

  const nutrition = payload.nutrition || {};
  ['calories', 'protein', 'carbs', 'fat'].forEach((field) => {
    if (nutrition[field] !== undefined && typeof nutrition[field] !== 'number') {
      errors.push(`${field} must be numeric`);
    }
  });

  const isPublishing = payload.status === 'Published';
  if (isPublishing) {
    if (!Array.isArray(payload.ingredients) || payload.ingredients.length === 0) {
      errors.push('ingredients required to publish');
    }
    if (!Array.isArray(payload.steps) || payload.steps.length === 0) {
      errors.push('steps required to publish');
    }
  }

  return errors;
};
