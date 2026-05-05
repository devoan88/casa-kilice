import Link from "next/link";
import { notFound } from "next/navigation";

import { CasaAdminCreatorForm, type PromoOption } from "@/components/casa-admin/CasaAdminCreatorForm";
import { CasaAdminCreatorMediaPanel, type CreatorMediaRow } from "@/components/casa-admin/CasaAdminCreatorMediaPanel";
import { requireCasaAdmin } from "@/lib/casaAdminAuth";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CasaAdminCreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCasaAdmin();
  const { id } = await params;

  const [creator, coupons, assignments, aggOrders] = await Promise.all([
    prisma.creator.findUnique({
      where: { id },
      include: { promoCoupon: { select: { code: true } }, media: { orderBy: { createdAt: "desc" } } },
    }),
    prisma.promoCoupon.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true } }),
    prisma.creator.findMany({
      where: { promoCouponId: { not: null } },
      select: { id: true, promoCouponId: true },
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

  if (!creator) notFound();

  const taken = new Set(
    assignments.filter((a) => a.id !== id && a.promoCouponId).map((a) => a.promoCouponId!),
  );
  const promoOptions: PromoOption[] = coupons
    .filter((c) => !taken.has(c.id) || c.id === creator.promoCouponId)
    .map((c) => ({ id: c.id, code: c.code }));

  const salesByCode = new Map<string, number>();
  for (const o of aggOrders) {
    const c = o.affiliatePromoCode?.trim().toUpperCase();
    if (!c) continue;
    const amt = o.totalCents ?? o.priceCents;
    salesByCode.set(c, (salesByCode.get(c) ?? 0) + amt);
  }
  const code = creator.promoCoupon?.code?.toUpperCase();
  const salesCents = code ? (salesByCode.get(code) ?? 0) : 0;

  const mediaRows: CreatorMediaRow[] = creator.media.map((m) => ({
    id: m.id,
    type: m.type,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted">
            <Link href="/casa-admin/creators" className="hover:text-[color:var(--espresso)]">
              ← Creators
            </Link>
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight md:text-3xl">{creator.name}</h1>
          <p className="mt-2 text-sm text-muted">
            <a href={creator.socialLink} className="text-[color:var(--espresso)] underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {creator.socialLink}
            </a>
          </p>
          <p className="mt-2 text-xs text-muted">
            Total sales generated (GEL, Paid + Delivered, linked promo):{" "}
            <strong className="text-[color:var(--espresso)]">{formatMoney(salesCents, "GEL")}</strong>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] p-6 md:p-8">
        <h2 className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[color:var(--espresso)]">Profile</h2>
        <div className="mt-5">
          <CasaAdminCreatorForm
            mode="edit"
            promoOptions={promoOptions}
            initial={{
              id: creator.id,
              name: creator.name,
              socialLink: creator.socialLink,
              followerCount: creator.followerCount,
              platform: creator.platform,
              profileImage: creator.profileImage,
              collaborationStatus: creator.collaborationStatus,
              promoCouponId: creator.promoCouponId,
            }}
          />
        </div>
      </div>

      <CasaAdminCreatorMediaPanel creatorId={creator.id} media={mediaRows} />
    </div>
  );
}
