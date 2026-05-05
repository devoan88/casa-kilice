import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  socialLink: z.string().trim().min(1).max(2000),
  followerCount: z.coerce.number().int().min(0).max(500_000_000),
  platform: z.enum(["Instagram", "TikTok"]),
  profileImage: z.string().trim().max(2048).optional().nullable(),
  collaborationStatus: z.enum(["Active", "Negotiating", "Completed", "Sent Product"]).optional(),
  promoCouponId: z.string().trim().min(1).max(80).optional().nullable(),
});

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const creators = await prisma.creator.findMany({
    orderBy: { name: "asc" },
    include: {
      promoCoupon: { select: { id: true, code: true } },
      _count: { select: { media: true } },
    },
  });

  const aggOrders = await prisma.order.findMany({
    where: {
      currency: "GEL",
      status: { in: ["Paid", "Delivered"] },
      affiliatePromoCode: { not: null },
    },
    select: { affiliatePromoCode: true, totalCents: true, priceCents: true },
  });

  const salesByCode = new Map<string, number>();
  for (const o of aggOrders) {
    const c = o.affiliatePromoCode?.trim().toUpperCase();
    if (!c) continue;
    const amt = o.totalCents ?? o.priceCents;
    salesByCode.set(c, (salesByCode.get(c) ?? 0) + amt);
  }

  const rows = creators.map((cr) => {
    const code = cr.promoCoupon?.code?.toUpperCase();
    const salesCents = code ? (salesByCode.get(code) ?? 0) : 0;
    return {
      id: cr.id,
      name: cr.name,
      socialLink: cr.socialLink,
      followerCount: cr.followerCount,
      platform: cr.platform,
      profileImage: cr.profileImage,
      collaborationStatus: cr.collaborationStatus,
      promoCouponId: cr.promoCouponId,
      promoCode: cr.promoCoupon?.code ?? null,
      mediaCount: cr._count.media,
      salesCents,
      updatedAt: cr.updatedAt.toISOString(),
    };
  });

  return NextResponse.json({ ok: true as const, creators: rows });
}

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid creator." }, { status: 400 });
  }

  const d = parsed.data;
  let promoCouponId: string | null = null;
  if (d.promoCouponId && d.promoCouponId.length > 0) {
    const exists = await prisma.promoCoupon.findUnique({ where: { id: d.promoCouponId }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ ok: false as const, error: "Promo coupon not found." }, { status: 400 });
    }
    const taken = await prisma.creator.findFirst({
      where: { promoCouponId: d.promoCouponId },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json({ ok: false as const, error: "That promo is already linked to another creator." }, { status: 409 });
    }
    promoCouponId = d.promoCouponId;
  }

  const creator = await prisma.creator.create({
    data: {
      name: d.name,
      socialLink: d.socialLink,
      followerCount: d.followerCount,
      platform: d.platform,
      profileImage: d.profileImage?.trim() ? d.profileImage.trim() : null,
      collaborationStatus: d.collaborationStatus ?? "Active",
      promoCouponId,
    },
  });

  revalidatePath("/casa-admin/creators");
  return NextResponse.json({ ok: true as const, creator: { id: creator.id } });
}
