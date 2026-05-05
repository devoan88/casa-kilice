import { unlink } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { creatorUgcRootDir } from "@/lib/creator/storagePaths";
import { prisma } from "@/lib/prisma";

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    socialLink: z.string().trim().min(1).max(2000).optional(),
    followerCount: z.coerce.number().int().min(0).max(500_000_000).optional(),
    platform: z.enum(["Instagram", "TikTok"]).optional(),
    profileImage: z.union([z.string().trim().max(2048), z.null()]).optional(),
    collaborationStatus: z.enum(["Active", "Negotiating", "Completed", "Sent Product"]).optional(),
    promoCouponId: z.union([z.string().trim().min(1).max(80), z.null()]).optional(),
  })
  .strict();

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const creator = await prisma.creator.findUnique({
    where: { id },
    include: {
      promoCoupon: { select: { id: true, code: true, percentOff: true, expiresAt: true, isActive: true } },
      media: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!creator) {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true as const,
    creator: {
      ...creator,
      createdAt: creator.createdAt.toISOString(),
      updatedAt: creator.updatedAt.toISOString(),
      promoCoupon: creator.promoCoupon
        ? {
            ...creator.promoCoupon,
            expiresAt: creator.promoCoupon.expiresAt.toISOString(),
          }
        : null,
      media: creator.media.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.creator.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid body." }, { status: 400 });
  }

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.name != null) data.name = d.name;
  if (d.socialLink != null) data.socialLink = d.socialLink;
  if (d.followerCount != null) data.followerCount = d.followerCount;
  if (d.platform != null) data.platform = d.platform;
  if (d.profileImage !== undefined) data.profileImage = d.profileImage === null ? null : d.profileImage;
  if (d.collaborationStatus != null) data.collaborationStatus = d.collaborationStatus;

  if (d.promoCouponId !== undefined) {
    if (d.promoCouponId === null) {
      data.promoCouponId = null;
    } else {
      const coupon = await prisma.promoCoupon.findUnique({ where: { id: d.promoCouponId }, select: { id: true } });
      if (!coupon) {
        return NextResponse.json({ ok: false as const, error: "Promo coupon not found." }, { status: 400 });
      }
      const taken = await prisma.creator.findFirst({
        where: { promoCouponId: d.promoCouponId, NOT: { id } },
        select: { id: true },
      });
      if (taken) {
        return NextResponse.json({ ok: false as const, error: "That promo is already linked to another creator." }, { status: 409 });
      }
      data.promoCouponId = d.promoCouponId;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false as const, error: "No changes." }, { status: 400 });
  }

  await prisma.creator.update({ where: { id }, data: data as object });
  revalidatePath("/casa-admin/creators");
  revalidatePath(`/casa-admin/creators/${id}`);
  return NextResponse.json({ ok: true as const });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.creator.findUnique({
    where: { id },
    include: { media: { select: { fileUrl: true } } },
  });
  if (!existing) {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }

  const root = path.resolve(creatorUgcRootDir());
  for (const m of existing.media) {
    const abs = path.resolve(path.join(root, m.fileUrl));
    const rootNorm = root.toLowerCase() + path.sep;
    const absNorm = abs.toLowerCase();
    if (absNorm === root.toLowerCase() || absNorm.startsWith(rootNorm)) {
      try {
        await unlink(abs);
      } catch {
        /* ignore */
      }
    }
  }

  await prisma.creator.delete({ where: { id } });
  revalidatePath("/casa-admin/creators");
  return NextResponse.json({ ok: true as const });
}
