import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    prepTime: { type: Number, required: true },
    cookTime: { type: Number, required: true },
    difficulty: { type: String, required: true },
    servings: { type: Number, required: true },
    ingredients: {
      type: [
        {
          name: String,
          quantity: String,
          unit: String,
        },
      ],
      default: [],
    },
    steps: {
      type: [
        {
          step: Number,
          description: String,
        },
      ],
      default: [],
    },
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    status: { type: String, default: 'Draft' },
    featured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Recipe = mongoose.model('Recipe', RecipeSchema);
