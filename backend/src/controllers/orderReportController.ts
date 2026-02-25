import { Order } from "../models/Order.js";

const parseDateBoundary = (value: any, isEnd: boolean) => {
  if (!value) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T${isEnd ? "23:59:59.999" : "00:00:00.000"}`);
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
};

const buildCreatedAtFilter = (from?: any, to?: any) => {
  const createdAt: any = {};
  const start = parseDateBoundary(from, false);
  const end = parseDateBoundary(to, true);
  if (start) createdAt.$gte = start;
  if (end) createdAt.$lte = end;
  return createdAt;
};

export const getOrderReport = async (req: any, res: any) => {
  const { from, to } = req.query || {};
  const createdAt = buildCreatedAtFilter(from, to);
  const filters: any = {};
  if (createdAt.$gte || createdAt.$lte) {
    filters.createdAt = createdAt;
  }
  const orders = await Order.find(filters).sort("-createdAt");
  res.json({ orders });
};