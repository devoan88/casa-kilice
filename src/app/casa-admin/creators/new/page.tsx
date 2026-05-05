import Link from "next/link";

import { CasaAdminCreatorForm, type PromoOption } from "@/components/casa-admin/CasaAdminCreatorForm";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CasaAdminCreatorNewPage() {
  await requireCasaAdmin();

  const [coupons, assignments] = await Promise.all([
    prisma.promoCoupon.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true } }),
    prisma.creator.findMany({
      where: { promoCouponId: { not: null } },
      select: { promoCouponId: true },
    }),
  ]);
  const taken = new Set(assignments.map((a) => a.promoCouponId!).filter(Boolean));
  const promoOptions: PromoOption[] = coupons.filter((c) => !taken.has(c.id)).map((c) => ({ id: c.id, code: c.code }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">
          <Link href="/casa-admin/creators" className="hover:text-[color:var(--espresso)]">
            ← Creators
          </Link>
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">New creator</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">Add an influencer profile. You can attach UGC after saving.</p>
      </div>

      <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 md:p-8">
        <CasaAdminCreatorForm mode="create" promoOptions={promoOptions} />
      </div>
    </div>
  );
}
