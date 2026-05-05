/** High-level phase for admin dashboards (maps legacy strings too). */
export type OrderPhase = "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled" | "Other";

export function orderPhaseLabel(status: string): OrderPhase {
  const s = status.trim();
  if (s === "Cancelled") return "Cancelled";
  if (s === "Delivered") return "Delivered";
  if (s === "Shipped") return "Shipped";
  if (s === "Paid") return "Paid";
  if (s === "Pending" || s === "Pending Verification" || s === "created") return "Pending";
  return "Other";
}
