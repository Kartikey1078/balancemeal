import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    allowSplit: { type: Boolean, default: true },
    week: { type: Number, default: 1 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
    isVeg: Boolean,
    image: String,
    description: String,
    available: { type: Boolean, default: true },
    tags: {
      type: [String],
      default: [],
    },
    baseOptions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Meal = mongoose.model('Meal', MealSchema);
