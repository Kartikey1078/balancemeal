import mongoose from 'mongoose';

const MasterRecipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    baseServings: { type: Number, required: true, min: 1 },
    desiredServings: { type: Number, required: true, min: 1 },
    ingredients: {
      type: [
        {
          name: String,
          baseQuantity: Number,
          unit: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const MasterRecipe = mongoose.model('MasterRecipe', MasterRecipeSchema);
