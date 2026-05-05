import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_ID } from "@/lib/siteContent";

const optionalText = z
  .union([z.string().max(8000), z.null()])
  .optional()
  .transform((v) => (v === "" ? null : v));

const optionalUrl = z
  .union([z.string().max(2048), z.null()])
  .optional()
  .transform((v) => {
    if (v === "" || v == null) return null;
    const t = v.trim();
    if (!t) return null;
    return t;
  })
  .refine(
    (s) => s == null || s.startsWith("/") || /^https?:\/\//i.test(s),
    "Hero image must be a URL or start with /",
  );

const patchSchema = z.object({
  homeHeroMainText: optionalText,
  homeHeroSubText: optionalText,
  homeHeroImageUrl: optionalUrl,
  gelPerUsd: z.number().finite().min(1).max(25).optional(),
  gelPerEur: z.number().finite().min(1).max(25).optional(),
  deliveryTbilisiGel: z.number().finite().min(0).max(500).optional(),
  deliveryRegionGel: z.number().finite().min(0).max(500).optional(),
  deliveryIntlGel: z.number().finite().min(0).max(2000).optional(),
  /** Percent of turnover (e.g. 1 = 1%). Stored as basis points (×100). */
  financeTaxPercent: z.number().finite().min(0).max(100).optional(),
});

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const row = await prisma.siteContent.findUnique({
    where: { id: SITE_CONTENT_ID },
    select: {
      homeHeroMainText: true,
      homeHeroSubText: true,
      homeHeroImageUrl: true,
      gelPerUsdMinor: true,
      gelPerEurMinor: true,
      deliveryTbilisiCents: true,
      deliveryRegionCents: true,
      deliveryIntlCents: true,
      financeTaxBps: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true as const, content: row });
}

export async function PATCH(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid body." }, { status: 400 });
  }

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if ("homeHeroMainText" in d) data.homeHeroMainText = d.homeHeroMainText ?? null;
  if ("homeHeroSubText" in d) data.homeHeroSubText = d.homeHeroSubText ?? null;
  if ("homeHeroImageUrl" in d) data.homeHeroImageUrl = d.homeHeroImageUrl ?? null;
  if (d.gelPerUsd != null) data.gelPerUsdMinor = Math.round(d.gelPerUsd * 100);
  if (d.gelPerEur != null) data.gelPerEurMinor = Math.round(d.gelPerEur * 100);
  if (d.deliveryTbilisiGel != null) data.deliveryTbilisiCents = Math.round(d.deliveryTbilisiGel * 100);
  if (d.deliveryRegionGel != null) data.deliveryRegionCents = Math.round(d.deliveryRegionGel * 100);
  if (d.deliveryIntlGel != null) data.deliveryIntlCents = Math.round(d.deliveryIntlGel * 100);
  if (d.financeTaxPercent != null) data.financeTaxBps = Math.round(d.financeTaxPercent * 100);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false as const, error: "No changes." }, { status: 400 });
  }

  const row = await prisma.siteContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: {
      id: SITE_CONTENT_ID,
      homeHeroMainText: (data.homeHeroMainText as string | null | undefined) ?? null,
      homeHeroSubText: (data.homeHeroSubText as string | null | undefined) ?? null,
      homeHeroImageUrl: (data.homeHeroImageUrl as string | null | undefined) ?? null,
      ...(typeof data.gelPerUsdMinor === "number" ? { gelPerUsdMinor: data.gelPerUsdMinor } : {}),
      ...(typeof data.gelPerEurMinor === "number" ? { gelPerEurMinor: data.gelPerEurMinor } : {}),
      ...(typeof data.deliveryTbilisiCents === "number" ? { deliveryTbilisiCents: data.deliveryTbilisiCents } : {}),
      ...(typeof data.deliveryRegionCents === "number" ? { deliveryRegionCents: data.deliveryRegionCents } : {}),
      ...(typeof data.deliveryIntlCents === "number" ? { deliveryIntlCents: data.deliveryIntlCents } : {}),
      ...(typeof data.financeTaxBps === "number" ? { financeTaxBps: data.financeTaxBps } : {}),
    },
    update: data,
    select: {
      homeHeroMainText: true,
      homeHeroSubText: true,
      homeHeroImageUrl: true,
      gelPerUsdMinor: true,
      gelPerEurMinor: true,
      deliveryTbilisiCents: true,
      deliveryRegionCents: true,
      deliveryIntlCents: true,
      financeTaxBps: true,
      updatedAt: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/checkout");
  revalidatePath("/casa-admin/finance");

  return NextResponse.json({ ok: true as const, content: row });
}
