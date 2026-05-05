import Link from "next/link";

import { CasaAdminLiveScanFeed } from "@/components/casa-admin/CasaAdminLiveScanFeed";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { isRevenueCountedStatus } from "@/lib/casaAdminAccounting";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function monthUtcRange(year: number, monthIndex: number) {
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));
  return { start, end };
}

export default async function CasaAdminDashboardPage() {
  await requireCasaAdmin();

  const [visitCount, orders, pendingMuseCount, userCount, consultationCount, saasPartnerCount] = await Promise.all([
    prisma.visit.count(),
    prisma.order.findMany({
      select: {
        id: true,
        status: true,
        totalCents: true,
        priceCents: true,
        currency: true,
        createdAt: true,
      },
    }),
    prisma.contentSubmission.count({ where: { status: "Pending" } }),
    prisma.user.count(),
    prisma.consultation.count(),
    prisma.saasPartner.count(),
  ]);

  const orderCount = orders.length;

  const revenueOrders = orders.filter((o) => isRevenueCountedStatus(o.status) && o.currency === "GEL");
  const revenueCents = revenueOrders.reduce((s, o) => s + (o.totalCents ?? o.priceCents), 0);

  const conversionPct = visitCount > 0 ? (orderCount / visitCount) * 100 : 0;

  const now = new Date();
  const thisY = now.getUTCFullYear();
  const thisM = now.getUTCMonth();
  const lastM = thisM === 0 ? 11 : thisM - 1;
  const lastY = thisM === 0 ? thisY - 1 : thisY;

  const thisRange = monthUtcRange(thisY, thisM);
  const lastRange = monthUtcRange(lastY, lastM);

  const sumRange = (start: Date, end: Date) =>
    revenueOrders.filter((o) => o.createdAt >= start && o.createdAt < end).reduce((s, o) => s + (o.totalCents ?? o.priceCents), 0);

  const revThisMonth = sumRange(thisRange.start, thisRange.end);
  const revLastMonth = sumRange(lastRange.start, lastRange.end);
  const growthPct =
    revLastMonth <= 0 ? (revThisMonth > 0 ? 100 : 0) : ((revThisMonth - revLastMonth) / revLastMonth) * 100;

  const chartMonths: { label: string; cents: number }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(thisY, thisM - i, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth();
    const { start, end } = monthUtcRange(y, m);
    const cents = revenueOrders.filter((o) => o.createdAt >= start && o.createdAt < end).reduce((s, o) => s + (o.totalCents ?? o.priceCents), 0);
    chartMonths.push({
      label: `${y}-${String(m + 1).padStart(2, "0")}`,
      cents,
    });
  }
  const chartMax = Math.max(...chartMonths.map((b) => b.cents), 1);

  const shortcuts = [
    { href: "/casa-admin/finance", title: "Finance", body: "Profit, tax estimate, expenses, and AOV." },
    { href: "/casa-admin/orders", title: "Orders", body: "Search, status, and fulfillment." },
    { href: "/casa-admin/products", title: "Products", body: "Pricing, cost, stock, and catalog visibility." },
    { href: "/casa-admin/customers", title: "Customers", body: "Spend and contacts from orders." },
    { href: "/casa-admin/content", title: "Homepage", body: "Hero copy and image overrides." },
    { href: "/casa-admin/marketing", title: "Marketing", body: "Newsletter and campaigns." },
    { href: "/casa-admin/creators", title: "Creators", body: "Influencers, UGC, and affiliate promo performance." },
    { href: "/casa-admin/muse", title: "Muse queue", body: `${pendingMuseCount} pending submission(s).` },
    {
      href: "/casa-admin/consultations",
      title: "Consultations",
      body: `${consultationCount.toLocaleString("en-US")} AI skin scan log(s) — photos & recommendations.`,
    },
    {
      href: "/casa-admin/saas",
      title: "Skin API SaaS",
      body: `${saasPartnerCount} B2B partner(s) · API keys & Stripe revenue.`,
    },
    { href: "/casa-admin/users", title: "Users", body: `${userCount.toLocaleString("en-US")} accounts.` },
  ];

  const glassCard =
    "rounded-xl border border-[color:color-mix(in_srgb,rgba(232,208,102)_18%,transparent)] bg-[color:color-mix(in_srgb,#0f0d0c_82%,#000)] p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-md";

  return (
    <div className="space-y-10">
      <CasaAdminLiveScanFeed />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[color:color-mix(in_srgb,#f5f0ea_94%,transparent)] md:text-3xl">
            Overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[color:color-mix(in_srgb,#e8dfd4_58%,transparent)]">
            Accounting snapshot: revenue counts orders marked <strong>Paid</strong> or <strong>Delivered</strong> in{" "}
            <strong>GEL</strong>. Stock moves when an order reaches <strong>Delivered</strong>. Every skin scan is logged
            under Consultations with photo, gender read, product slug, and full AI text.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/casa-admin/consultations/export-xlsx"
            className="rounded-full border border-[color:color-mix(in_srgb,rgba(232,208,102)_40%,transparent)] bg-[color:color-mix(in_srgb,#0f0d0c_88%,#000)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--neon-amber)] shadow-[0_0_28px_rgba(232,208,102,0.14)] hover:bg-[color:color-mix(in_srgb,#fff_06%,transparent)]"
          >
            Export Excel
          </a>
          <a
            href="/api/casa-admin/export/sales"
            className="rounded-full border border-[color:color-mix(in_srgb,rgba(232,208,102)_25%,transparent)] bg-[color:color-mix(in_srgb,#12100e_90%,transparent)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--neon-amber)] shadow-[0_0_24px_rgba(232,208,102,0.10)] hover:bg-[color:color-mix(in_srgb,#fff_06%,transparent)]"
          >
            Export CSV
          </a>
        </div>
      </div>

      <section aria-label="Summary">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:color-mix(in_srgb,rgba(232,208,102)_75%,#ccc)]">
          Summary
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <li className={glassCard}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,#e8dfd4_45%,transparent)]">
              Total revenue (GEL)
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums text-[color:color-mix(in_srgb,#f5f0ea_94%,transparent)]">
              {formatMoney(revenueCents, "GEL")}
            </p>
            <p className="mt-1 text-xs text-[color:color-mix(in_srgb,#e8dfd4_48%,transparent)]">Paid + Delivered orders, GEL only.</p>
          </li>
          <li className={glassCard}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,#e8dfd4_45%,transparent)]">
              Total orders
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums text-[color:color-mix(in_srgb,#f5f0ea_94%,transparent)]">
              {orderCount.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-xs text-[color:color-mix(in_srgb,#e8dfd4_48%,transparent)]">All statuses in the database.</p>
          </li>
          <li className={glassCard}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,#e8dfd4_45%,transparent)]">
              Conversion rate
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums text-[color:color-mix(in_srgb,#f5f0ea_94%,transparent)]">
              {visitCount > 0 ? `${conversionPct.toFixed(1)}%` : "—"}
            </p>
            <p className="mt-1 text-xs text-[color:color-mix(in_srgb,#e8dfd4_48%,transparent)]">
              Orders ÷ all-time visits ({visitCount.toLocaleString("en-US")}).
            </p>
          </li>
          <li className={glassCard}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,#e8dfd4_45%,transparent)]">
              Month vs last (GEL)
            </p>
            <p
              className={[
                "mt-2 font-[family-name:var(--font-display)] text-3xl tabular-nums",
                growthPct >= 0 ? "text-emerald-300" : "text-amber-300",
              ].join(" ")}
            >
              {growthPct >= 0 ? "+" : ""}
              {growthPct.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-[color:color-mix(in_srgb,#e8dfd4_48%,transparent)]">
              This month {formatMoney(revThisMonth, "GEL")} vs last {formatMoney(revLastMonth, "GEL")}.
            </p>
          </li>
        </ul>
      </section>

      <section aria-label="Revenue trend">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:color-mix(in_srgb,rgba(232,208,102)_75%,#ccc)]">
          Revenue trend · 6 months · GEL
        </h2>
        <div className={`mt-4 p-6 ${glassCard}`}>
          <div className="flex h-44 items-end justify-between gap-3">
            {chartMonths.map((b) => {
              const pct = Math.max(4, Math.round((b.cents / chartMax) * 100));
              return (
                <div key={b.label} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-[120px] w-full items-end justify-center">
                    <div
                      className="relative w-[68%] overflow-hidden rounded-t-[6px]"
                      style={{ height: `${pct}%` }}
                      title={`${b.label}: ${formatMoney(b.cents, "GEL")}`}
                    >
                      {/* base */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(to top, rgba(232,196,92,0.55), rgba(232,196,92,0.18))",
                          boxShadow: "0 0 12px rgba(232,196,92,0.22), inset 0 1px 0 rgba(232,196,92,0.4)",
                        }}
                      />
                      {/* animated glow cap */}
                      <div
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{
                          background: "rgba(232,196,92,0.9)",
                          boxShadow: "0 0 8px 2px rgba(232,196,92,0.6)",
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-[color:color-mix(in_srgb,rgba(232,196,92)_55%,#888)] group-hover:text-[color:rgba(232,196,92,0.85)] transition-colors">
                    {b.label.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-right text-[9px] uppercase tracking-[0.2em] text-[color:rgba(232,196,92,0.35)]">
            Max: {formatMoney(chartMax, "GEL")}
          </p>
        </div>
      </section>

      <section aria-label="Shortcuts">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:color-mix(in_srgb,rgba(232,208,102)_75%,#ccc)]">
          Management
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block h-full rounded-xl border border-[color:color-mix(in_srgb,rgba(232,208,102)_16%,transparent)] bg-[color:color-mix(in_srgb,#0c0a09_88%,#000)] p-5 shadow-[0_0_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all hover:border-[color:color-mix(in_srgb,rgba(232,208,102)_42%,transparent)] hover:shadow-[0_0_40px_rgba(232,208,102,0.08)]"
              >
                <p className="font-[family-name:var(--font-display)] text-lg text-[color:color-mix(in_srgb,#f5f0ea_94%,transparent)]">{s.title}</p>
                <p className="mt-2 text-sm text-[color:color-mix(in_srgb,#e8dfd4_55%,transparent)]">{s.body}</p>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[color:var(--neon-amber)]">Open →</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
