import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'amount'], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
    validFrom: { type: Date },
    validTo: { type: Date },
    // 0 or undefined = unlimited per user
    maxUsesPerUser: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', CouponSchema);
