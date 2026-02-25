import { Order } from '../models/Order.js';

export const getMyOrders = async (req: any, res: any) => {
  const email = req.user?.email;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  const orders = await Order.find({
    $or: [{ email }, { 'deliveryDetails.email': email }],
  }).sort('-createdAt');
  res.json({ orders });
};
