import Link from "next/link";

import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SnapItem = { id?: string; name?: string; qty?: number; price?: number };

function summarizeItems(itemsJson: string): string {
  try {
    const j = JSON.parse(itemsJson) as unknown;
    if (!Array.isArray(j) || j.length === 0) return "—";
    const parts = (j as SnapItem[])
      .filter((row) => row && typeof row.name === "string")
      .map((row) => {
        const q = typeof row.qty === "number" ? row.qty : 1;
        return `${row.name} × ${q}`;
      });
    return parts.length ? parts.join(" · ") : "—";
  } catch {
    return "—";
  }
}

export default async function CasaAdminAbandonedCartsPage() {
  await requireCasaAdmin();

  const carts = await prisma.abandonedCart.findMany({
    where: { convertedAt: null },
    orderBy: { lastSeenAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">
          <Link href="/casa-admin/orders" className="hover:text-[color:var(--espresso)]">
            ← Orders
          </Link>
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">Abandoned carts</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Anonymous sessions that still had items in the cart (no checkout yet). Use the line items to recognise products; there is no
          email until the guest completes checkout.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              <th className="px-4 py-3">Last activity</th>
              <th className="px-4 py-3">Browser id</th>
              <th className="px-4 py-3">Cart</th>
            </tr>
          </thead>
          <tbody>
            {carts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                  No open carts right now.
                </td>
              </tr>
            ) : (
              carts.map((c) => (
                <tr key={c.id} className="border-b border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {new Date(c.lastSeenAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-[color:var(--espresso)]">
                    {c.clientKey.length > 14 ? `${c.clientKey.slice(0, 8)}…${c.clientKey.slice(-4)}` : c.clientKey}
                  </td>
                  <td className="max-w-xl px-4 py-3 text-xs leading-relaxed text-[color:var(--espresso)]">{summarizeItems(c.itemsJson)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
