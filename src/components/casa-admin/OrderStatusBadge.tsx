function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function OrderStatusBadge({ status }: { status: string }) {
  const n = normalize(status);
  let cls =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]";

  if (n === "paid" || n === "completed") {
    cls += " border-emerald-500/80 bg-emerald-100 text-emerald-950";
  } else if (n === "pending" || n === "pending verification" || n === "created") {
    cls += " border-amber-400/80 bg-amber-50 text-amber-950";
  } else if (n === "shipped") {
    cls += " border-sky-500/80 bg-sky-100 text-sky-950";
  } else if (n === "delivered") {
    cls += " border-teal-500/80 bg-teal-50 text-teal-950";
  } else if (n === "cancelled" || n === "canceled") {
    cls += " border-red-200 bg-red-50 text-red-900";
  } else {
    cls +=
      " border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--sand-soft)] text-[color:var(--espresso)]";
  }

  return <span className={cls}>{status}</span>;
}
