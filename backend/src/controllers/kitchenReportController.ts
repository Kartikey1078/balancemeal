import { Order } from '../models/Order.js';

const parseDateBoundary = (value: any, isEnd: boolean) => {
  if (!value) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T${isEnd ? '23:59:59.999' : '00:00:00.000'}`);
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

const normalizeBaseOption = (value: any) => {
  const trimmed = String(value || '').trim();
  return trimmed.length > 0 ? trimmed : 'Default';
};

const normalizeMealName = (item: any) => {
  return (
    item?.meal?.name ||
    item?.meal?.title ||
    item?.meal?.id ||
    item?.name ||
    'Unknown Meal'
  );
};

const addToBucket = (
  bucket: Map<
    string,
    {
      mealName: string;
      baseOptions: Map<string, number>;
      totalQuantity: number;
    }
  >,
  mealName: string,
  baseOption: string,
  quantity: number
) => {
  if (!Number.isFinite(quantity) || quantity <= 0) return;
  const existing = bucket.get(mealName);
  if (!existing) {
    const baseOptions = new Map<string, number>();
    baseOptions.set(baseOption, quantity);
    bucket.set(mealName, {
      mealName,
      baseOptions,
      totalQuantity: quantity,
    });
    return;
  }
  const prev = existing.baseOptions.get(baseOption) || 0;
  existing.baseOptions.set(baseOption, prev + quantity);
  existing.totalQuantity += quantity;
};

export const getKitchenReport = async (req: any, res: any) => {
  const { from, to, day } = req.query || {};
  const createdAt = buildCreatedAtFilter(from, to);
  const filters: any = { status: { $ne: 'CANCELLED' } };
  if (createdAt.$gte || createdAt.$lte) {
    filters.createdAt = createdAt;
  }

  const orders = await Order.find(filters).select('items');

  const sundayMap = new Map<
    string,
    { mealName: string; baseOptions: Map<string, number>; totalQuantity: number }
  >();
  const wednesdayMap = new Map<
    string,
    { mealName: string; baseOptions: Map<string, number>; totalQuantity: number }
  >();

  let totalSunday = 0;
  let totalWednesday = 0;

  for (const order of orders) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const quantity = Number(item?.quantity || 0);
      if (!Number.isFinite(quantity) || quantity <= 0) continue;

      const mealName = normalizeMealName(item);
      const baseOption = normalizeBaseOption(item?.baseOption);

      const split = item?.deliverySplit || {};
      const sundayQty = Number(split?.sunday || 0);
      const wednesdayQty = Number(split?.wednesday || 0);
      const splitTotal = sundayQty + wednesdayQty;

      if (splitTotal > 0) {
        addToBucket(sundayMap, mealName, baseOption, sundayQty);
        addToBucket(wednesdayMap, mealName, baseOption, wednesdayQty);
        totalSunday += sundayQty;
        totalWednesday += wednesdayQty;
      } else {
        addToBucket(sundayMap, mealName, baseOption, quantity);
        totalSunday += quantity;
      }
    }
  }

  const toRows = (
    bucket: Map<
      string,
      { mealName: string; baseOptions: Map<string, number>; totalQuantity: number }
    >
  ) => {
    return Array.from(bucket.values())
      .map((entry) => {
        const baseOptionQuantities = Array.from(entry.baseOptions.entries()).map(
          ([baseOption, quantity]) => ({
            baseOption,
            quantity,
          })
        );
        return {
          mealName: entry.mealName,
          baseOptions: baseOptionQuantities.map((b) => b.baseOption),
          baseOptionQuantities,
          totalQuantity: entry.totalQuantity,
        };
      })
      .sort((a, b) => a.mealName.localeCompare(b.mealName));
  };

  const dayKey = String(day || '').toLowerCase();
  const byDay = {
    sunday: toRows(sundayMap),
    wednesday: toRows(wednesdayMap),
  };
  const totals = {
    sunday: totalSunday,
    wednesday: totalWednesday,
  };

  if (dayKey === 'sunday' || dayKey === 'wednesday') {
    return res.json({
      byDay: { [dayKey]: byDay[dayKey] },
      totals: { [dayKey]: totals[dayKey] },
    });
  }

  res.json({ byDay, totals });
};
