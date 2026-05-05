/** Statuses that count toward recognized revenue (GEL) on the admin dashboard. */
export const REVENUE_ORDER_STATUSES = ["Delivered", "Paid"] as const;

export function isRevenueCountedStatus(status: string): boolean {
  const s = status.trim();
  return s === "Delivered" || s === "Paid";
}
