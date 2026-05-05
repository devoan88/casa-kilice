import { isRevenueCountedStatus } from "@/lib/casaAdminAccounting";

/** Order is still awaiting payment / confirmation (watchdog targets these). */
export function isPendingPaymentWatchdogStatus(status: string): boolean {
  const n = status.trim().toLowerCase();
  return n === "pending" || n === "created" || n === "pending verification";
}

export function isStalePendingOrder(createdAt: Date, status: string, nowMs = Date.now()): boolean {
  if (!isPendingPaymentWatchdogStatus(status)) return false;
  return nowMs - createdAt.getTime() >= 24 * 60 * 60 * 1000;
}

type LineLike = { slug?: unknown; qty?: unknown };

/** Estimated COGS for one order using unit costs (GEL lines only). */
export function orderCogsCents(
  order: {
    lineItemsJson: string | null;
    productId: string | null;
    currency: string;
  },
  costBySlug: Map<string, number>,
  costByProductId: Map<string, number>,
): number {
  if (order.currency !== "GEL") return 0;
  try {
    const j = JSON.parse(order.lineItemsJson || "null") as unknown;
    if (Array.isArray(j)) {
      let total = 0;
      for (const row of j) {
        if (!row || typeof row !== "object") continue;
        const slug = (row as LineLike).slug;
        const qty = (row as LineLike).qty;
        if (typeof slug === "string" && typeof qty === "number" && qty > 0) {
          const c = costBySlug.get(slug);
          if (c != null) total += c * qty;
        }
      }
      if (total > 0) return total;
    }
  } catch {
    /* ignore */
  }
  if (order.productId) {
    const c = costByProductId.get(order.productId);
    if (c != null) return c;
  }
  return 0;
}

export function monthUtcRange(year: number, monthIndex: number) {
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

export function orderRevenueCents(order: { totalCents: number | null; priceCents: number }): number {
  return order.totalCents ?? order.priceCents;
}

export function filterRevenueOrdersGel<T extends { status: string; currency: string }>(orders: T[]): T[] {
  return orders.filter((o) => o.currency === "GEL" && isRevenueCountedStatus(o.status));
}

export function estimatedTaxCents(revenueCents: number, taxBps: number): number {
  if (taxBps <= 0 || revenueCents <= 0) return 0;
  return Math.round((revenueCents * taxBps) / 10_000);
}
