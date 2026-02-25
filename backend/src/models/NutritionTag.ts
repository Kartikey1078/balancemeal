import mongoose from 'mongoose';

const NutritionTagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const NutritionTag = mongoose.model(
  'NutritionTag',
  NutritionTagSchema
);
