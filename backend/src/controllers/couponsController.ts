import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import {
  applyCouponToTotal,
  calculateWeeklyTotal,
  normalizeCouponCode,
} from '../utils/pricing.js';

export const validateCoupon = async (req: any, res: any) => {
  const { code, items, planId, email } = req.body;
  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return res.status(400).json({ valid: false, error: 'Enter a coupon code' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ valid: false, error: 'Cart is empty' });
  }
  const coupon: any = await Coupon.findOne({ code: normalized, active: true });
  if (!coupon) {
    return res.status(404).json({ valid: false, error: 'Invalid coupon' });
  }

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return res
      .status(400)
      .json({ valid: false, error: 'Coupon is not valid yet' });
  }
  if (coupon.validTo && now > coupon.validTo) {
    return res.status(400).json({ valid: false, error: 'Coupon has expired' });
  }

  if (coupon.maxUsesPerUser && coupon.maxUsesPerUser > 0) {
    if (!email) {
      return res.status(400).json({
        valid: false,
        error: 'Email is required to use this coupon',
      });
    }
    const usage = await Order.countDocuments({
      couponCode: coupon.code,
      $or: [{ email }, { 'deliveryDetails.email': email }],
    });
    if (usage >= coupon.maxUsesPerUser) {
      return res.status(400).json({
        valid: false,
        error: 'Coupon already used for this email',
      });
    }
  }

  const { subtotal } = calculateWeeklyTotal(items, planId);
  const { discountAmount, totalAfterDiscount } = applyCouponToTotal(
    subtotal,
    coupon
  );
  return res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
    totalAfterDiscount,
  });
};
