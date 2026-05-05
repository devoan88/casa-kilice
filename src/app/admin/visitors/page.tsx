import Link from "next/link";
import { redirect } from "next/navigation";

import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { prisma } from "@/lib/prisma";
import { VisitorsMap } from "@/components/VisitorsMap";

export default async function VisitorsAdminPage() {
  // Secure: same auth rules as /casa-admin (role=ADMIN or ADMIN_EMAIL allowlist)
  await requireCasaAdmin();

  const visits = await prisma.visit.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/orders"
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Manual orders
        </Link>
        <p className="text-sm tracking-[0.28em] uppercase text-muted">Admin</p>
        <h1 className="text-3xl tracking-tight md:text-4xl">
          Visitor locations
        </h1>
        <p className="max-w-prose text-muted">
          რუკაზე ჩანს ბოლო ვიზიტორების ლოკაციები (IP გეოლოკაციით). მონაცემები ინახება
          ლოკალურ ბაზაში.
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        <VisitorsMap
          visits={visits.map((v) => ({
            id: v.id,
            createdAt: v.createdAt.toISOString(),
            country: v.country,
            region: v.region,
            city: v.city,
            latitude: v.latitude,
            longitude: v.longitude,
            path: v.path,
          }))}
        />

        <div className="rounded-[28px] border border-border bg-surface p-6">
          <h2 className="text-lg tracking-tight">Latest visits</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Path</th>
                </tr>
              </thead>
              <tbody>
                {visits.slice(0, 30).map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="py-3 pr-4 text-muted">
                      {v.createdAt.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      {[v.city, v.region, v.country].filter(Boolean).join(", ") ||
                        "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted">{v.path ?? "/"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

