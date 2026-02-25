import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    customerName: String,
    email: String,
    items: Array,
    totalPrice: Number,
    subtotal: Number,
    discountAmount: { type: Number, default: 0 },
    couponCode: String,
    couponType: String,
    couponValue: Number,
    status: { type: String, default: 'PLACED' },
    deliveryDetails: Object,
    deliverySchedule: {
      sunday: { type: Number, default: 0 },
      wednesday: { type: Number, default: 0 },
    },
    paymentId: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', OrderSchema);
