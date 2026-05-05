"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CasaAdminOrderEditModal } from "@/components/casa-admin/CasaAdminOrderEditModal";
import { CasaAdminPaymentBadge } from "@/components/casa-admin/CasaAdminPaymentBadge";
import { OrderStatusBadge } from "@/components/casa-admin/OrderStatusBadge";
import { isStalePendingOrder } from "@/lib/casaAdminFinance";
import { formatMoney } from "@/lib/money";
import { formatPublicOrderNumber } from "@/lib/orderPublicNumber";
import { summarizeOrderLineItems } from "@/lib/orderItemsSummary";

const CORE_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"] as const;

function LifecyclePill({ status }: { status: string }) {
  const n = status.trim().toLowerCase();
  const cls =
    n === "paid" || n === "completed"
      ? "border-emerald-500/80 bg-emerald-100 text-emerald-950"
      : n === "pending" || n === "pending verification" || n === "created"
        ? "border-amber-400/80 bg-amber-50 text-amber-950"
        : n === "shipped"
          ? "border-sky-500/80 bg-sky-100 text-sky-950"
          : n === "delivered"
            ? "border-teal-500/80 bg-teal-50 text-teal-950"
            : n === "cancelled" || n === "canceled"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--sand-soft)] text-[color:var(--espresso)]";

  const label =
    n === "completed"
      ? "Paid"
      : n === "pending verification" || n === "created"
        ? "Pending"
        : status;

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        cls,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export type CasaAdminOrderRow = {
  id: string;
  orderNumber: string | null;
  userId: string | null;
  createdAt: string;
  status: string;
  orderKind: string | null;
  productId: string | null;
  productName: string;
  lineItemsJson: string | null;
  currency: string;
  priceCents: number;
  subtotalCents: number | null;
  shippingCents: number | null;
  discountCents: number | null;
  discountDescription: string | null;
  totalCents: number | null;
  customerFullName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  deliveryAddress: string | null;
  deliveryZone: string | null;
  paymentMethod: string | null;
  stripeSessionId: string | null;
  manualPublicToken: string | null;
};

export function CasaAdminOrdersTable({ orders }: { orders: CasaAdminOrderRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [reminding, setReminding] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<CasaAdminOrderRow | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))]">
      <table className="w-full min-w-[1240px] text-left text-sm">
        <thead>
          <tr className="border-b border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Order #</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Pay</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const paymentWatchdog = isStalePendingOrder(new Date(o.createdAt), o.status);
            return (
            <tr
              key={o.id}
              className={[
                "border-b border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] align-top last:border-0",
                paymentWatchdog ? "border-l-4 border-l-amber-500 bg-amber-50/40" : "",
              ].join(" ")}
            >
              <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                {new Date(o.createdAt).toLocaleString("en-US", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-4 py-3 font-mono text-xs font-medium text-[color:var(--espresso)]">
                {formatPublicOrderNumber(o.orderNumber) ?? "—"}
              </td>
              <td className="px-4 py-3">
                <LifecyclePill status={o.status} />
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={o.status} />
              </td>
              <td className="px-4 py-3">
                <CasaAdminPaymentBadge method={o.paymentMethod} />
              </td>
              <td className="max-w-[160px] px-4 py-3 text-xs font-medium">
                <span className="text-[color:var(--espresso)]">{o.customerFullName ?? "—"}</span>
                {o.deliveryAddress ? (
                  <span className="mt-1 block text-[10px] font-normal leading-snug text-muted">
                    {o.deliveryAddress.length > 100 ? `${o.deliveryAddress.slice(0, 100)}…` : o.deliveryAddress}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{o.customerPhone ?? "—"}</td>
              <td className="max-w-[220px] px-4 py-3 text-xs leading-snug text-muted">
                <span className="text-[color:var(--espresso)]">
                  {summarizeOrderLineItems(o.productName, o.lineItemsJson)}
                </span>
                {o.customerEmail ? (
                  <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted/90">{o.customerEmail}</span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-xs font-medium">
                {o.totalCents != null ? formatMoney(o.totalCents, o.currency) : formatMoney(o.priceCents, o.currency)}
              </td>
              <td className="px-4 py-3">
                <div className="flex min-w-[11rem] flex-col gap-2">
                  <a
                    href={`/api/casa-admin/orders/${o.id}/invoice`}
                    className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:var(--surface)] px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[color:var(--espresso)] hover:bg-[color:color-mix(in_srgb,var(--sand)_60%,transparent)]"
                  >
                    Download invoice
                  </a>
                  <button
                    type="button"
                    onClick={() => setEditTarget(o)}
                    className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:var(--surface)] px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[color:var(--espresso)] hover:bg-[color:color-mix(in_srgb,var(--sand)_60%,transparent)]"
                  >
                    Edit all fields
                  </button>
                  <label className="text-[9px] font-semibold uppercase tracking-wide text-muted">Status</label>
                  <select
                    key={`${o.id}-${o.status}`}
                    disabled={busy === o.id}
                    defaultValue={CORE_STATUSES.includes(o.status as (typeof CORE_STATUSES)[number]) ? o.status : ""}
                    onChange={async (e) => {
                      const status = e.target.value;
                      if (!status) return;
                      setBusy(o.id);
                      try {
                        const res = await fetch(`/api/casa-admin/orders/${o.id}/status`, {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ status }),
                        });
                        if (!res.ok) {
                          e.target.value = CORE_STATUSES.includes(o.status as (typeof CORE_STATUSES)[number]) ? o.status : "";
                          return;
                        }
                        router.refresh();
                      } finally {
                        setBusy(null);
                      }
                    }}
                    className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-2 py-1.5 text-[10px] uppercase tracking-wide text-[color:var(--espresso)]"
                  >
                    <option value="">Set status…</option>
                    {!CORE_STATUSES.includes(o.status as (typeof CORE_STATUSES)[number]) ? (
                      <option value={o.status}>{o.status} (current)</option>
                    ) : null}
                    {CORE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {o.orderKind ? (
                    <span className="text-[9px] uppercase tracking-wide text-muted">Kind: {o.orderKind}</span>
                  ) : null}
                  {paymentWatchdog ? (
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-amber-900">
                      Pending &gt; 24h
                    </span>
                  ) : null}
                  {paymentWatchdog && o.customerEmail ? (
                    <button
                      type="button"
                      disabled={reminding === o.id}
                      onClick={async () => {
                        setReminding(o.id);
                        try {
                          const res = await fetch(`/api/casa-admin/orders/${o.id}/payment-reminder`, { method: "POST" });
                          const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; skipped?: boolean } | null;
                          if (!res.ok || !j?.ok) {
                            window.alert(j?.error ?? "Could not send reminder.");
                            return;
                          }
                          window.alert("Reminder email sent.");
                          router.refresh();
                        } finally {
                          setReminding(null);
                        }
                      }}
                      className="rounded-lg border border-amber-600/50 bg-amber-100/90 px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-amber-950 hover:bg-amber-100 disabled:opacity-50"
                    >
                      {reminding === o.id ? "Sending…" : "Send reminder email"}
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
      <CasaAdminOrderEditModal
        order={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
