export const PLANS = [
  { id: 'plan_5', price: 66, mealLimit: 5, extraPrice: 12.9 },
  { id: 'plan_10', price: 121, mealLimit: 10, extraPrice: 11.9 },
];

export const normalizeCouponCode = (code: any) =>
  String(code || '').trim().toUpperCase();

export const calculateWeeklyTotal = (items: any[], planId?: string) => {
  const totalMeals = (items || []).reduce((sum, item) => {
    const qty = Number(item?.quantity || 0);
    return sum + (Number.isFinite(qty) ? qty : 0);
  }, 0);
  if (!totalMeals) {
    return { totalMeals: 0, subtotal: 0, planUsed: PLANS[0], extraCharges: 0 };
  }
  const selectedPlan = PLANS.find((plan) => plan.id === planId);
  const planUsed = selectedPlan || (totalMeals >= 10 ? PLANS[1] : PLANS[0]);
  const extraCount = Math.max(0, totalMeals - planUsed.mealLimit);
  const extraCharges = extraCount * planUsed.extraPrice;
  const subtotal = planUsed.price + extraCharges;
  return { totalMeals, subtotal, planUsed, extraCharges };
};

export const applyCouponToTotal = (subtotal: number, coupon: any) => {
  if (!coupon) {
    return { discountAmount: 0, totalAfterDiscount: subtotal };
  }
  const rawDiscount =
    coupon.type === 'percent'
      ? subtotal * (coupon.value / 100)
      : coupon.value;
  const discountAmount = Math.max(0, Math.min(subtotal, rawDiscount));
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  return { discountAmount, totalAfterDiscount };
};
