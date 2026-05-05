"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ProductOption = { slug: string; name: string; isActive: boolean };

type Line = { slug: string; qty: number };

export function CasaAdminManualOrderPanel() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [lines, setLines] = useState<Line[]>([{ slug: "", qty: 1 }]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">("cod");
  const [sendEmail, setSendEmail] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/casa-admin/products");
    if (!res.ok) return;
    const data = (await res.json()) as { ok?: boolean; products?: { slug: string; name: string; isActive: boolean }[] };
    if (data.ok && data.products) {
      setProducts(
        data.products
          .filter((p) => p.slug && p.isActive)
          .map((p) => ({ slug: p.slug, name: p.name, isActive: p.isActive })),
      );
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_97%,var(--sand))] p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--espresso)]">
            Create manual order
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            For Instagram / WhatsApp or phone sales. Creates the same database row as the public checkout (shows in this
            list immediately).
          </p>
        </div>
      </div>

      <form
        className="mt-6 grid gap-4 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg(null);
          const items = lines
            .filter((l) => l.slug.trim() && l.qty >= 1)
            .map((l) => ({ slug: l.slug.trim(), qty: l.qty }));
          if (items.length === 0) {
            setMsg("Add at least one product line with a slug.");
            return;
          }
          setBusy(true);
          try {
            const res = await fetch("/api/casa-admin/orders/manual", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                items,
                fullName: fullName.trim(),
                phone: phone.trim(),
                email: email.trim(),
                address: address.trim(),
                paymentMethod,
                sendConfirmationEmail: sendEmail,
              }),
            });
            const json = (await res.json().catch(() => ({}))) as { ok?: boolean; orderId?: string; error?: string };
            if (!res.ok || !json.ok) {
              setMsg(json.error ?? "Could not create order.");
              return;
            }
            setMsg(`Created order ${json.orderId}.`);
            setLines([{ slug: "", qty: 1 }]);
            router.refresh();
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="md:col-span-2 space-y-3">
          {lines.map((line, idx) => (
            <div key={idx} className="flex flex-wrap items-end gap-2">
              <label className="min-w-[12rem] flex-1 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Product</span>
                <select
                  value={line.slug}
                  onChange={(ev) => {
                    const v = ev.target.value;
                    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, slug: v } : l)));
                  }}
                  className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-2 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </label>
              <label className="w-24 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Qty</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={line.qty}
                  onChange={(ev) => {
                    const q = Number(ev.target.value);
                    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, qty: Number.isFinite(q) ? q : 1 } : l)));
                  }}
                  className="mt-1 w-full rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-2 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                disabled={lines.length <= 1}
                className="mb-0.5 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_16%,transparent)] px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, { slug: "", qty: 1 }])}
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--espresso)] underline-offset-4 hover:underline"
          >
            + Add line
          </button>
        </div>

        <label className="grid gap-1 text-xs md:col-span-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Full name</span>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Phone</span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs md:col-span-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Exact address</span>
          <textarea
            required
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Payment</span>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "cod" | "bank_transfer")}
            className="rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-sm"
          >
            <option value="cod">Cash on delivery</option>
            <option value="bank_transfer">Bank transfer</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs md:col-span-2">
          <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
          Send confirmation email to customer (requires Resend)
        </label>
        {msg ? <p className="text-sm text-muted md:col-span-2">{msg}</p> : null}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[color:var(--espresso)] px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-soft)] disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create manual order"}
          </button>
        </div>
      </form>
    </div>
  );
}
