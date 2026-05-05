import Link from "next/link";

import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function collabClass(status: string) {
  const map: Record<string, string> = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-950",
    Negotiating: "border-amber-200 bg-amber-50 text-amber-950",
    Completed: "border-slate-200 bg-slate-50 text-slate-800",
    "Sent Product": "border-sky-200 bg-sky-50 text-sky-950",
  };
  return map[status] ?? "border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:var(--sand-soft)] text-[color:var(--espresso)]";
}

export default async function CasaAdminCreatorsPage() {
  await requireCasaAdmin();

  const [creators, aggOrders] = await Promise.all([
    prisma.creator.findMany({
      orderBy: { name: "asc" },
      include: {
        promoCoupon: { select: { code: true } },
        _count: { select: { media: true } },
      },
    }),
    prisma.order.findMany({
      where: {
        currency: "GEL",
        status: { in: ["Paid", "Delivered"] },
        affiliatePromoCode: { not: null },
      },
      select: { affiliatePromoCode: true, totalCents: true, priceCents: true },
    }),
  ]);

  const salesByCode = new Map<string, number>();
  for (const o of aggOrders) {
    const c = o.affiliatePromoCode?.trim().toUpperCase();
    if (!c) continue;
    const amt = o.totalCents ?? o.priceCents;
    salesByCode.set(c, (salesByCode.get(c) ?? 0) + amt);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Creators</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Influencer profiles, UGC uploads, and affiliate performance. Link each creator to a promo code; recognised{" "}
            <strong>GEL</strong> sales (Paid + Delivered) with that code at checkout count toward totals.
          </p>
        </div>
        <Link
          href="/casa-admin/creators/new"
          className="rounded-full bg-[color:var(--espresso)] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--sand-soft)]"
        >
          Add creator
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              <th className="px-4 py-3"> </th>
              <th className="px-4 py-3">Creator</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Promo</th>
              <th className="px-4 py-3 text-right">Sales generated</th>
              <th className="px-4 py-3 text-right">UGC</th>
              <th className="px-4 py-3"> </th>
            </tr>
          </thead>
          <tbody>
            {creators.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted">
                  No creators yet. Add your first influencer profile.
                </td>
              </tr>
            ) : (
              creators.map((cr) => {
                const code = cr.promoCoupon?.code?.toUpperCase();
                const salesCents = code ? (salesByCode.get(code) ?? 0) : 0;
                const img = cr.profileImage?.trim();
                return (
                  <tr key={cr.id} className="border-b border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] align-middle last:border-0">
                    <td className="px-4 py-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--espresso)_04%,transparent)]">
                        {img && (img.startsWith("http") || img.startsWith("/")) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[color:var(--espresso)]">{cr.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted">{cr.followerCount.toLocaleString("en-US")} followers</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{cr.platform}</td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                          collabClass(cr.collaborationStatus),
                        ].join(" ")}
                      >
                        {cr.collaborationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{cr.promoCoupon?.code ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs font-medium text-[color:var(--espresso)]">
                      {formatMoney(salesCents, "GEL")}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs text-muted">{cr._count.media}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/casa-admin/creators/${cr.id}`}
                        className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--espresso)] underline-offset-4 hover:underline"
                      >
                        Open
                      </Link>
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
