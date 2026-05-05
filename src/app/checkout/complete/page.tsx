import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutCompleteClearCart } from "@/components/checkout/CheckoutCompleteClearCart";
import { getCasaBankDetails } from "@/lib/bankDetails";
import { formatMoney } from "@/lib/money";
import { formatPublicOrderNumber } from "@/lib/orderPublicNumber";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Thank you — Casa Kilicé",
  description: "Your order was received.",
};

function pickToken(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : null;
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      const t = typeof v === "string" ? v.trim() : "";
      if (t.length > 0) return t;
    }
  }
  return null;
}

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const token = pickToken(sp.token);
  if (!token) notFound();

  const order = await prisma.order.findUnique({
    where: { manualPublicToken: token },
  });
  if (!order) notFound();

  const bank = getCasaBankDetails();
  const name = order.customerFullName?.trim() || "there";
  const orderLabel = formatPublicOrderNumber(order.orderNumber) ?? `Order ${order.id.slice(0, 8)}…`;
  const isBank = order.paymentMethod === "bank_transfer";
  const isCod = order.paymentMethod === "cod";
  const totalCents = order.totalCents ?? order.priceCents ?? 0;
  const cashDueLabel = formatMoney(totalCents, order.currency);

  let lines: { name: string; qty: number; lineTotalCents: number }[] = [];
  try {
    const j = JSON.parse(order.lineItemsJson || "[]") as unknown;
    if (Array.isArray(j)) {
      lines = j.filter(
        (row): row is { name: string; qty: number; lineTotalCents: number } =>
          row != null &&
          typeof row === "object" &&
          typeof (row as { name?: unknown }).name === "string" &&
          typeof (row as { qty?: unknown }).qty === "number" &&
          typeof (row as { lineTotalCents?: unknown }).lineTotalCents === "number",
      );
    }
  } catch {
    lines = [];
  }

  const paymentLabel =
    order.paymentMethod === "bank_transfer"
      ? "Bank transfer"
      : order.paymentMethod === "cod"
        ? "Cash on delivery (pay at the door)"
        : order.paymentMethod ?? "—";

  return (
    <div className="min-h-[80vh] bg-[color:var(--sand)] pb-24 pt-10 md:pt-16">
      <CheckoutCompleteClearCart />
      <div className="mx-auto max-w-2xl px-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted">Casa Kilicé</p>

        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--espresso)] md:text-4xl">
          Thank you for your order, {name}!
        </h1>

        <p className="mt-4 text-base leading-relaxed text-[color:var(--espresso)]">
          Your order number is:{" "}
          <strong className="font-mono tracking-tight">{orderLabel}</strong>
        </p>

        <p className="mt-2 text-sm text-muted">
          Payment: <span className="text-[color:var(--espresso)]">{paymentLabel}</span> · Status{" "}
          <strong className="text-[color:var(--espresso)]">{order.status}</strong>
        </p>

        {isBank ? (
          <p className="mt-6 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_98%,#fff)] p-5 text-sm leading-relaxed text-[color:var(--espresso)]">
            Please transfer <strong>{formatMoney(totalCents, order.currency)}</strong> to IBAN:{" "}
            <span className="font-mono">{bank.iban}</span> and include your order number{" "}
            <strong className="font-mono">{orderLabel}</strong> in the payment description.
          </p>
        ) : null}

        {isCod ? (
          <p className="mt-6 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_98%,#fff)] p-5 text-base leading-relaxed text-[color:var(--espresso)]">
            Your order <strong className="font-mono tracking-tight">{orderLabel}</strong> is confirmed. You will pay{" "}
            <strong>{totalCents === 6500 ? "65 GEL" : cashDueLabel}</strong> in cash when your package arrives.
          </p>
        ) : null}

        {lines.length > 0 ? (
          <div className="mt-10 rounded-[1.15rem] border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_96%,#fff)] p-6 shadow-[0_16px_48px_rgba(60,53,48,0.06)]">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Your order</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {lines.map((l, i) => (
                <li key={i} className="flex justify-between gap-3 text-[color:var(--espresso)]">
                  <span>
                    {l.name} × {l.qty}
                  </span>
                  <span className="tabular-nums">{formatMoney(l.lineTotalCents, order.currency)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] pt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--espresso)]">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="tabular-nums">{formatMoney(totalCents, order.currency)}</span>
              </div>
            </div>
          </div>
        ) : null}

        <Link
          href="/"
          className="mt-12 inline-flex text-[10px] font-semibold uppercase tracking-[0.26em] text-[color:var(--espresso)] underline-offset-4 hover:text-[color:var(--hermes)] hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
