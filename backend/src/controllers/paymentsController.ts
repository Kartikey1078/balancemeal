import crypto from 'crypto';
import { squareClient } from '../config/square.js';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import {
  applyCouponToTotal,
  calculateWeeklyTotal,
  normalizeCouponCode,
} from '../utils/pricing.js';

export const processPayment = async (req: any, res: any) => {
  const {
    sourceId,
    amount,
    deliveryDetails,
    items,
    customerEmail,
    deliverySchedule,
    couponCode,
    planId,
  } = req.body;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const currency = process.env.SQUARE_CURRENCY || 'CAD';

  try {
    if (!sourceId) {
      return res.status(400).json({ success: false, error: 'Missing sourceId' });
    }
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing items' });
    }
    if (!deliveryDetails?.fullName || !deliveryDetails?.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing delivery details',
      });
    }
    const orderEmail = customerEmail || deliveryDetails.email;
    const normalizedCoupon = normalizeCouponCode(couponCode);
    const coupon = normalizedCoupon
      ? await Coupon.findOne({ code: normalizedCoupon, active: true })
      : null;
    const { subtotal } = calculateWeeklyTotal(items, planId);
    const { discountAmount, totalAfterDiscount } = applyCouponToTotal(
      subtotal,
      coupon
    );
    const computedAmount = Number(totalAfterDiscount.toFixed(2));
    if (Math.abs(computedAmount - amount) > 0.01) {
      return res.status(400).json({
        success: false,
        error: 'Invalid weekly commitment amount',
      });
    }

    const payment = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      ...(locationId ? { locationId } : {}),
      amountMoney: {
        amount: BigInt(Math.round(computedAmount * 100)),
        currency,
      },
    });

    const order = new Order({
      customerName: deliveryDetails.fullName,
      email: orderEmail,
      items,
      totalPrice: computedAmount,
      subtotal,
      discountAmount,
      couponCode: coupon?.code,
      couponType: coupon?.type,
      couponValue: coupon?.value,
      status: 'PLACED',
      deliveryDetails,
      deliverySchedule,
      paymentId: payment.result.payment?.id,
    });

    await order.save();

    res.json({ success: true, order });
  } catch (err: any) {
    const squareErrors = err?.result?.errors;
    const errorMessage =
      Array.isArray(squareErrors) && squareErrors.length > 0
        ? squareErrors.map((e: any) => e.detail || e.code).join('; ')
        : err.message || 'Payment failed';
    const status = err?.statusCode || 500;
    res.status(status).json({
      success: false,
      error: errorMessage,
      errors: squareErrors || undefined,
    });
  }
};
