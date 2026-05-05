"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AssetSvg } from "@/components/AssetSvg";
import { useCart } from "@/components/cart/CartProvider";
import type { CasaBankDetails } from "@/lib/bankDetails";
import { formatMoney } from "@/lib/money";

const CURRENCY = "GEL";

function gelMajorToCents(major: number) {
  return Math.round(major * 100);
}

type Props = { bank: CasaBankDetails; defaultEmail: string };

export function CheckoutClient({ bank, defaultEmail }: Props) {
  const router = useRouter();
  const cart = useCart();

  const [payBank, setPayBank] = useState(false);
  const [payCod, setPayCod] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completingRef = useRef(false);
  const emailPrefilled = useRef(false);

  useEffect(() => {
    if (completingRef.current) return;
    if (cart.items.length === 0) {
      router.replace("/shop");
    }
  }, [cart.items.length, router]);

  useEffect(() => {
    if (emailPrefilled.current) return;
    if (defaultEmail.trim()) {
      setEmail(defaultEmail.trim());
      emailPrefilled.current = true;
    }
  }, [defaultEmail]);

  const subtotalCents = useMemo(
    () => cart.items.reduce((a, b) => a + gelMajorToCents(b.price) * b.qty, 0),
    [cart.items],
  );

  const paymentMethod = payBank ? "bank_transfer" : payCod ? "cod" : null;

  const toggleBank = (checked: boolean) => {
    setPayBank(checked);
    if (checked) setPayCod(false);
    else if (!payCod) setPayCod(true);
  };

  const toggleCod = (checked: boolean) => {
    setPayCod(checked);
    if (checked) setPayBank(false);
    else if (!payBank) setPayBank(true);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[50vh] bg-[color:var(--sand)] px-5 py-20 text-center text-muted">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[color:var(--sand)] pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-3xl px-5">
        <Link
          href="/shop"
          className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:color-mix(in_srgb,var(--espresso)_70%,#555)] underline-offset-4 hover:text-[color:var(--hermes)] hover:underline"
        >
          ← Continue shopping
        </Link>

        <header className="mt-8 border-b border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] pb-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted">Casa Kilicé</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--espresso)] md:text-4xl">
            Checkout
          </h1>
        </header>

        <div className="mt-10 space-y-10">
          <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_98%,#fff)] p-6 md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">Step 1 — Payment</p>
            <div className="mt-6 space-y-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={payBank}
                  onChange={(e) => toggleBank(e.target.checked)}
                  className="mt-1 accent-[color:var(--espresso)]"
                />
                <span className="text-sm leading-snug text-[color:var(--espresso)]">
                  Bank transfer{" "}
                  <span className="font-mono text-xs text-muted">(IBAN: {bank.iban})</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={payCod}
                  onChange={(e) => toggleCod(e.target.checked)}
                  className="mt-1 accent-[color:var(--espresso)]"
                />
                <span className="text-sm text-[color:var(--espresso)]">Cash on delivery (pay at the door)</span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_98%,#fff)] p-6 md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">Step 2 — Your details</p>
            <div className="mt-6 space-y-5">
              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Full name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                  className="h-11 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  autoComplete="tel"
                  required
                  className="h-11 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Exact address</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={4}
                  className="resize-y rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Partner promo code (optional)</span>
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CREATOR10"
                  autoComplete="off"
                  className="h-11 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--surface)] px-3 font-mono text-sm uppercase text-[color:var(--espresso)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
                  maxLength={40}
                />
                <span className="text-[10px] text-muted">If valid, the discount is applied when you complete the order. Totals update server-side.</span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_98%,#fff)] p-6 md:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">Order</p>
            <ul className="mt-4 space-y-3">
              {cart.items.map((it) => (
                <li key={it.id} className="flex gap-3 text-sm">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)]">
                    <AssetSvg src={it.imageSrc} alt="" className="h-full w-full" fit="slice" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[color:var(--espresso)]">{it.name}</p>
                    <p className="text-xs text-muted">
                      {formatMoney(gelMajorToCents(it.price), CURRENCY)} × {it.qty}
                    </p>
                  </div>
                  <p className="shrink-0 tabular-nums text-[color:var(--espresso)]">
                    {formatMoney(gelMajorToCents(it.price) * it.qty, CURRENCY)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between border-t border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] pt-4 font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--espresso)]">
              <span>Total</span>
              <span className="tabular-nums">{formatMoney(subtotalCents, CURRENCY)}</span>
            </div>
          </section>

          {error ? <p className="text-sm text-red-800/90">{error}</p> : null}

          <button
            type="button"
            disabled={submitting || !paymentMethod}
            onClick={async () => {
              setError(null);
              if (!paymentMethod) {
                setError("Choose a payment method.");
                return;
              }
              if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
                setError("Please fill in all fields.");
                return;
              }
              setSubmitting(true);
              try {
                const res = await fetch("/api/orders/manual", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    items: cart.items.map((i) => ({ slug: i.id, qty: i.qty })),
                    fullName: fullName.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    address: address.trim(),
                    paymentMethod,
                    promoCode: promoCode.trim() || undefined,
                  }),
                });
                const json = (await res.json().catch(() => ({}))) as {
                  ok?: boolean;
                  error?: string;
                  token?: string;
                };
                if (!res.ok || !json.ok || !json.token) {
                  setError(json?.error ?? "Could not complete order.");
                  return;
                }
                completingRef.current = true;
                // Do not clear the cart here: clearing triggers an immediate re-render with an empty cart
                // ("Redirecting…") and can interrupt navigation to the success page. The success page clears the cart.
                router.push(`/checkout/complete?token=${encodeURIComponent(json.token)}`);
              } finally {
                setSubmitting(false);
              }
            }}
            className="w-full rounded-full bg-[color:var(--espresso)] py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--surface)] transition-opacity hover:opacity-[0.96] disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Complete order"}
          </button>
        </div>
      </div>
    </div>
  );
}
