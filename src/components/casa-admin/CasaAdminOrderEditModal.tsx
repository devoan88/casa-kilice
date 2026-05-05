"use client";

import { useEffect, useState } from "react";

import type { CasaAdminOrderRow } from "@/components/casa-admin/CasaAdminOrdersTable";

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  order: CasaAdminOrderRow | null;
  onClose: () => void;
  onSaved: () => void;
};

export function CasaAdminOrderEditModal({ order, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [orderKind, setOrderKind] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [currency, setCurrency] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [subtotalCents, setSubtotalCents] = useState("");
  const [shippingCents, setShippingCents] = useState("");
  const [discountCents, setDiscountCents] = useState("");
  const [discountDescription, setDiscountDescription] = useState("");
  const [totalCents, setTotalCents] = useState("");
  const [customerFullName, setCustomerFullName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"" | "cod" | "bank_transfer">("");
  const [lineItemsJson, setLineItemsJson] = useState("");
  const [stripeSessionId, setStripeSessionId] = useState("");
  const [manualPublicToken, setManualPublicToken] = useState("");
  const [userId, setUserId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [createdAtLocal, setCreatedAtLocal] = useState("");

  useEffect(() => {
    if (!order) return;
    setError(null);
    setStatus(order.status);
    setOrderKind(order.orderKind ?? "");
    setProductId(order.productId ?? "");
    setProductName(order.productName);
    setCurrency(order.currency);
    setPriceCents(String(order.priceCents));
    setSubtotalCents(order.subtotalCents != null ? String(order.subtotalCents) : "");
    setShippingCents(order.shippingCents != null ? String(order.shippingCents) : "");
    setDiscountCents(order.discountCents != null ? String(order.discountCents) : "");
    setDiscountDescription(order.discountDescription ?? "");
    setTotalCents(order.totalCents != null ? String(order.totalCents) : "");
    setCustomerFullName(order.customerFullName ?? "");
    setCustomerPhone(order.customerPhone ?? "");
    setCustomerEmail(order.customerEmail ?? "");
    setDeliveryAddress(order.deliveryAddress ?? "");
    setDeliveryZone(order.deliveryZone ?? "");
    setPaymentMethod(
      order.paymentMethod === "cod" || order.paymentMethod === "bank_transfer"
        ? order.paymentMethod
        : "",
    );
    setLineItemsJson(order.lineItemsJson ?? "");
    setStripeSessionId(order.stripeSessionId ?? "");
    setManualPublicToken(order.manualPublicToken ?? "");
    setUserId(order.userId ?? "");
    setOrderNumber(order.orderNumber?.trim() ? order.orderNumber.trim() : "");
    setCreatedAtLocal(isoToDatetimeLocalValue(order.createdAt));
  }, [order]);

  if (!order) return null;

  const parseIntField = (raw: string, label: string): number | null | undefined => {
    const t = raw.trim();
    if (t === "") return null;
    const n = Number.parseInt(t, 10);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error(`${label} must be a non-negative integer or empty.`);
    }
    return n;
  };

  const parseIntRequired = (raw: string, label: string): number => {
    const n = Number.parseInt(raw.trim(), 10);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error(`${label} must be a non-negative integer.`);
    }
    return n;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    const orderId = order.id;
    setError(null);
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        status: status.trim(),
        orderKind: orderKind.trim() === "" ? null : orderKind.trim(),
        productId: productId.trim() === "" ? null : productId.trim(),
        productName: productName.trim(),
        currency: currency.trim(),
        priceCents: parseIntRequired(priceCents, "Price (cents)"),
        customerFullName: customerFullName.trim() === "" ? null : customerFullName.trim(),
        customerPhone: customerPhone.trim() === "" ? null : customerPhone.trim(),
        customerEmail: customerEmail.trim() === "" ? null : customerEmail.trim(),
        deliveryAddress: deliveryAddress.trim() === "" ? null : deliveryAddress.trim(),
        deliveryZone: deliveryZone.trim() === "" ? null : deliveryZone.trim(),
        paymentMethod: paymentMethod === "" ? null : paymentMethod,
        lineItemsJson: lineItemsJson.trim() === "" ? null : lineItemsJson.trim(),
        stripeSessionId: stripeSessionId.trim() === "" ? null : stripeSessionId.trim(),
        manualPublicToken: manualPublicToken.trim() === "" ? null : manualPublicToken.trim(),
        userId: userId.trim() === "" ? null : userId.trim(),
        orderNumber: orderNumber.trim() === "" ? null : orderNumber.trim(),
        discountDescription: discountDescription.trim() === "" ? null : discountDescription.trim(),
        subtotalCents: parseIntField(subtotalCents, "Subtotal"),
        shippingCents: parseIntField(shippingCents, "Shipping"),
        discountCents: parseIntField(discountCents, "Discount"),
        totalCents: parseIntField(totalCents, "Total"),
      };
      const created = new Date(createdAtLocal);
      if (Number.isNaN(created.getTime())) {
        throw new Error("Order date is invalid.");
      }
      body.createdAt = created.toISOString();

      const res = await fetch(`/api/casa-admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !j?.ok) {
        throw new Error(j?.error ?? `Save failed (${res.status}).`);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--espresso)] outline-none focus:border-[color:color-mix(in_srgb,var(--espresso)_35%,transparent)]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-edit-title"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="order-edit-title" className="text-lg font-semibold tracking-tight text-[color:var(--espresso)]">
              Edit order
            </h2>
            <p className="mt-1 font-mono text-xs text-muted">{order.id}</p>
            <a
              href={`/api/casa-admin/orders/${order.id}/invoice`}
              className="mt-3 inline-flex rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:var(--surface)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--espresso)] hover:bg-[color:color-mix(in_srgb,var(--sand)_60%,transparent)]"
            >
              Download invoice (PDF)
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-[color:color-mix(in_srgb,var(--sand)_80%,transparent)]"
          >
            Close
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-xs font-medium text-muted">
            Order date
            <input
              type="datetime-local"
              value={createdAtLocal}
              onChange={(e) => setCreatedAtLocal(e.target.value)}
              className={fieldClass}
              required
            />
          </label>
          <label className="block text-xs font-medium text-muted">
            Status
            <input value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass} required />
          </label>
          <label className="block text-xs font-medium text-muted">
            Public order ref (stored as CK-1001, shown as #CK-1001)
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. CK-1001"
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-medium text-muted">
            Order kind
            <input value={orderKind} onChange={(e) => setOrderKind(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Product ID
            <input value={productId} onChange={(e) => setProductId(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Linked user ID
            <input value={userId} onChange={(e) => setUserId(e.target.value)} className={fieldClass} />
          </label>
          <label className="sm:col-span-2 block text-xs font-medium text-muted">
            Product name
            <input value={productName} onChange={(e) => setProductName(e.target.value)} className={fieldClass} required />
          </label>
          <label className="block text-xs font-medium text-muted">
            Currency
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={fieldClass} required />
          </label>
          <label className="block text-xs font-medium text-muted">
            Price (cents)
            <input
              inputMode="numeric"
              value={priceCents}
              onChange={(e) => setPriceCents(e.target.value)}
              className={fieldClass}
              required
            />
          </label>
          <label className="block text-xs font-medium text-muted">
            Subtotal (cents, optional)
            <input inputMode="numeric" value={subtotalCents} onChange={(e) => setSubtotalCents(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Shipping (cents, optional)
            <input inputMode="numeric" value={shippingCents} onChange={(e) => setShippingCents(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Discount (cents, optional)
            <input inputMode="numeric" value={discountCents} onChange={(e) => setDiscountCents(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Total (cents, optional)
            <input inputMode="numeric" value={totalCents} onChange={(e) => setTotalCents(e.target.value)} className={fieldClass} />
          </label>
          <label className="sm:col-span-2 block text-xs font-medium text-muted">
            Discount description
            <input value={discountDescription} onChange={(e) => setDiscountDescription(e.target.value)} className={fieldClass} />
          </label>
          <label className="sm:col-span-2 block text-xs font-medium text-muted">
            Payment method
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "" | "cod" | "bank_transfer")}
              className={fieldClass}
            >
              <option value="">— None —</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cod">Cash (on delivery)</option>
            </select>
          </label>
          <label className="sm:col-span-2 block text-xs font-medium text-muted">
            Full name
            <input value={customerFullName} onChange={(e) => setCustomerFullName(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Phone
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Email
            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={fieldClass} />
          </label>
          <label className="sm:col-span-2 block text-xs font-medium text-muted">
            Delivery address
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={3}
              className={fieldClass + " resize-y"}
            />
          </label>
          <label className="sm:col-span-2 block text-xs font-medium text-muted">
            Delivery zone / notes
            <input value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Stripe session ID
            <input value={stripeSessionId} onChange={(e) => setStripeSessionId(e.target.value)} className={fieldClass} />
          </label>
          <label className="block text-xs font-medium text-muted">
            Manual public token
            <input value={manualPublicToken} onChange={(e) => setManualPublicToken(e.target.value)} className={fieldClass} />
          </label>
          <label className="sm:col-span-2 block text-xs font-medium text-muted">
            Line items JSON (array)
            <textarea
              value={lineItemsJson}
              onChange={(e) => setLineItemsJson(e.target.value)}
              rows={6}
              className={fieldClass + " resize-y font-mono text-xs"}
              spellCheck={false}
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] px-4 py-2 text-sm text-[color:var(--espresso)] hover:bg-[color:color-mix(in_srgb,var(--sand)_50%,transparent)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[color:var(--espresso)] px-4 py-2 text-sm font-medium text-[color:var(--sand-soft)] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
