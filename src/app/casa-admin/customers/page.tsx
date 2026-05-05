import Link from "next/link";

import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  key: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  orders: number;
  spendCents: number;
  lastOrder: Date;
};

export default async function CasaAdminCustomersPage() {
  await requireCasaAdmin();

  const orders = await prisma.order.findMany({
    where: { status: { not: "Cancelled" }, currency: "GEL" },
    select: {
      customerEmail: true,
      customerPhone: true,
      customerFullName: true,
      totalCents: true,
      priceCents: true,
      currency: true,
      createdAt: true,
    },
  });

  const byKey = new Map<string, Row>();
  for (const o of orders) {
    const email = o.customerEmail?.trim() || null;
    const phone = o.customerPhone?.trim() || null;
    const key = email ? `e:${email.toLowerCase()}` : phone ? `p:${phone}` : "";
    if (!key) continue;
    const spend = o.totalCents ?? o.priceCents;
    const prev = byKey.get(key);
    const name = o.customerFullName?.trim() || null;
    if (!prev) {
      byKey.set(key, {
        key,
        email: email ? email : null,
        phone: phone ?? null,
        name,
        orders: 1,
        spendCents: spend,
        lastOrder: o.createdAt,
      });
    } else {
      prev.orders += 1;
      prev.spendCents += spend;
      if (o.createdAt > prev.lastOrder) prev.lastOrder = o.createdAt;
      if (!prev.name && name) prev.name = name;
      if (!prev.email && email) prev.email = email;
      if (!prev.phone && phone) prev.phone = phone;
    }
  }

  const rows = [...byKey.values()].sort((a, b) => b.spendCents - a.spendCents);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Customers</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Everyone who placed a non-cancelled order, grouped by email or phone. Spend sums <strong>GEL</strong> orders only (total or line price).{" "}
            <strong>VIP</strong> highlights guests with more than three orders.
          </p>
        </div>
        <Link
          href="/casa-admin/orders"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--espresso)] underline-offset-4 hover:underline"
        >
          ← Orders
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Total spend</th>
              <th className="px-4 py-3">Last order</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  No customer records yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const vip = r.orders > 3;
                return (
                <tr
                  key={r.key}
                  className={[
                    "border-b border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] align-top last:border-0",
                    vip ? "bg-[color:color-mix(in_srgb,#fef3c7_55%,transparent)]" : "",
                  ].join(" ")}
                >
                  <td className="px-4 py-3 font-medium text-[color:var(--espresso)]">
                    <span className="inline-flex flex-wrap items-center gap-2">
                      {r.name ?? "—"}
                      {vip ? (
                        <span className="rounded-full border border-amber-400/80 bg-amber-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-950">
                          VIP · {r.orders} orders
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{r.email ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">{r.orders}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs font-medium">
                    {formatMoney(r.spendCents, "GEL")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                    {r.lastOrder.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
