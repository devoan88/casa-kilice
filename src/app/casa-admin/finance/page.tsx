import Link from "next/link";

import { CasaAdminExpensesPanel } from "@/components/casa-admin/CasaAdminExpensesPanel";
import { CasaAdminFinanceTaxCard } from "@/components/casa-admin/CasaAdminFinanceTaxCard";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { estimatedTaxCents, filterRevenueOrdersGel, monthUtcRange, orderCogsCents, orderRevenueCents } from "@/lib/casaAdminFinance";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_ID } from "@/lib/siteContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CasaAdminFinancePage() {
  await requireCasaAdmin();

  const [orders, products, expenses, siteRow] = await Promise.all([
    prisma.order.findMany({
      select: {
        status: true,
        currency: true,
        createdAt: true,
        totalCents: true,
        priceCents: true,
        lineItemsJson: true,
        productId: true,
      },
    }),
    prisma.product.findMany({ select: { id: true, slug: true, costCents: true } }),
    prisma.businessExpense.findMany({ orderBy: { incurredAt: "desc" } }),
    prisma.siteContent.findUnique({
      where: { id: SITE_CONTENT_ID },
      select: { financeTaxBps: true },
    }),
  ]);

  const taxBps = siteRow?.financeTaxBps ?? 0;
  const costBySlug = new Map(products.map((p) => [p.slug, p.costCents]));
  const costByProductId = new Map(products.map((p) => [p.id, p.costCents]));

  const rev = filterRevenueOrdersGel(orders);
  const revenueAll = rev.reduce((s, o) => s + orderRevenueCents(o), 0);
  const cogsAll = rev.reduce((s, o) => s + orderCogsCents(o, costBySlug, costByProductId), 0);
  const expensesAllGel = expenses.filter((e) => e.currency === "GEL").reduce((s, e) => s + e.amountCents, 0);
  const netAll = revenueAll - cogsAll - expensesAllGel;

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const { start: monthStart, end: monthEnd } = monthUtcRange(y, m);

  const revMonth = rev.filter((o) => o.createdAt >= monthStart && o.createdAt < monthEnd);
  const revenueMonth = revMonth.reduce((s, o) => s + orderRevenueCents(o), 0);
  const cogsMonth = revMonth.reduce((s, o) => s + orderCogsCents(o, costBySlug, costByProductId), 0);
  const expensesMonth = expenses
    .filter((e) => e.currency === "GEL" && e.incurredAt >= monthStart && e.incurredAt < monthEnd)
    .reduce((s, e) => s + e.amountCents, 0);
  const netMonth = revenueMonth - cogsMonth - expensesMonth;
  const taxMonth = estimatedTaxCents(revenueMonth, taxBps);

  const denomAll = rev.length;
  const denomMonth = revMonth.length;
  const aovAll = denomAll > 0 ? Math.round(revenueAll / denomAll) : 0;
  const aovMonth = denomMonth > 0 ? Math.round(revenueMonth / denomMonth) : 0;

  const chartMax = Math.max(revenueMonth, expensesMonth, 1);
  const incomeH = Math.max(8, Math.round((revenueMonth / chartMax) * 120));
  const expenseH = Math.max(8, Math.round((expensesMonth / chartMax) * 120));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">
            <Link href="/casa-admin" className="hover:text-[color:var(--espresso)]">
              ← Overview
            </Link>
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Virtual accountant</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Profit uses <strong>recognised GEL revenue</strong> (Paid + Delivered), <strong>unit cost</strong> from products matched to order lines, and{" "}
            <strong>recorded expenses</strong>. Figures stay in this console only.
          </p>
        </div>
        <Link
          href="/casa-admin/orders"
          className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:var(--surface)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--espresso)] hover:bg-[color:color-mix(in_srgb,var(--sand)_55%,transparent)]"
        >
          Orders
        </Link>
      </div>

      <section aria-label="Profit summary">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Net profit</h2>
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          <li className="rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">This month (UTC)</p>
            <p
              className={[
                "mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums",
                netMonth >= 0 ? "text-emerald-900" : "text-red-900",
              ].join(" ")}
            >
              {formatMoney(netMonth, "GEL")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Revenue {formatMoney(revenueMonth, "GEL")} − COGS {formatMoney(cogsMonth, "GEL")} − operating{" "}
              {formatMoney(expensesMonth, "GEL")}.
            </p>
          </li>
          <li className="rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">All time (GEL)</p>
            <p
              className={[
                "mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums",
                netAll >= 0 ? "text-emerald-900" : "text-red-900",
              ].join(" ")}
            >
              {formatMoney(netAll, "GEL")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Revenue {formatMoney(revenueAll, "GEL")} − COGS {formatMoney(cogsAll, "GEL")} − operating {formatMoney(expensesAllGel, "GEL")}.
            </p>
          </li>
        </ul>
      </section>

      <section aria-label="Tax and AOV">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">Tax &amp; AOV</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          <li className="rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Est. tax (this month)</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tabular-nums text-[color:var(--espresso)]">{formatMoney(taxMonth, "GEL")}</p>
            <p className="mt-1 text-xs text-muted">{(taxBps / 100).toFixed(2)}% of {formatMoney(revenueMonth, "GEL")} turnover.</p>
          </li>
          <li className="rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">AOV — this month</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tabular-nums text-[color:var(--espresso)]">{formatMoney(aovMonth, "GEL")}</p>
            <p className="mt-1 text-xs text-muted">
              {denomMonth} paid/delivered order{denomMonth === 1 ? "" : "s"} in range.
            </p>
          </li>
          <li className="rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">AOV — all time</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tabular-nums text-[color:var(--espresso)]">{formatMoney(aovAll, "GEL")}</p>
            <p className="mt-1 text-xs text-muted">
              {denomAll} paid/delivered order{denomAll === 1 ? "" : "s"}.
            </p>
          </li>
        </ul>
      </section>

      <section aria-label="Monthly income vs expense">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">This month — income vs operating expense</h2>
        <div className="mt-4 rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 shadow-sm">
          <div className="flex h-44 items-end justify-center gap-16">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-[120px] w-20 items-end justify-center">
                <div
                  className="w-full rounded-t-md bg-[color:color-mix(in_srgb,var(--espresso)_32%,transparent)]"
                  style={{ height: `${incomeH}px` }}
                  title={`Income: ${formatMoney(revenueMonth, "GEL")}`}
                />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Income</span>
              <span className="font-mono text-xs text-[color:var(--espresso)]">{formatMoney(revenueMonth, "GEL")}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-[120px] w-20 items-end justify-center">
                <div
                  className="w-full rounded-t-md bg-[color:color-mix(in_srgb,#b45309_35%,transparent)]"
                  style={{ height: `${expenseH}px` }}
                  title={`Expenses: ${formatMoney(expensesMonth, "GEL")}`}
                />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Expenses</span>
              <span className="font-mono text-xs text-amber-950">{formatMoney(expensesMonth, "GEL")}</span>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-muted">
            COGS is excluded from the orange bar — it is already deducted in <strong>Net profit</strong>.
          </p>
        </div>
      </section>

      <CasaAdminFinanceTaxCard initialTaxBps={taxBps} />
      <CasaAdminExpensesPanel />
    </div>
  );
}
