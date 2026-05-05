import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import { priceCentsFromGel } from "@/lib/products";

const patchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(12000).optional(),
    category: z.string().min(1).max(120).optional(),
    priceGel: z.coerce.number().positive().max(1_000_000).optional(),
    costGel: z.coerce.number().min(0).max(1_000_000).optional(),
    imageUrl: z
      .union([z.string().max(2048), z.null()])
      .optional()
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null) return null;
        const t = v.trim();
        return t === "" ? null : t;
      })
      .refine(
        (s) => s === undefined || s == null || s.startsWith("/") || /^https?:\/\//i.test(s),
        "Image must be a URL or start with /",
      ),
    isActive: z.boolean().optional(),
    stock: z.coerce.number().int().min(0).max(9_999_999).optional(),
  })
  .strict();

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!existing) {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid body." }, { status: 400 });
  }

  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.name != null) data.name = d.name;
  if (d.description != null) data.description = d.description;
  if (d.category != null) data.category = d.category;
  if (d.priceGel != null) data.priceCents = priceCentsFromGel(d.priceGel);
  if (d.costGel !== undefined) data.costCents = priceCentsFromGel(d.costGel);
  if (d.imageUrl !== undefined) data.imageUrl = d.imageUrl ?? null;
  if (d.isActive != null) data.isActive = d.isActive;
  if (d.stock != null) data.stock = d.stock;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false as const, error: "No changes." }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: data as object,
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      priceCents: true,
      costCents: true,
      currency: true,
      imageUrl: true,
      isActive: true,
      stock: true,
      updatedAt: true,
    },
  });

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/shop/${existing.slug}`);
  revalidatePath(`/shop/${product.slug}`);
  revalidatePath("/casa-admin/finance");

  return NextResponse.json({ ok: true as const, product });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) {
    return NextResponse.json({ ok: false as const, error: "Not found." }, { status: 404 });
  }

  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/shop");
  revalidatePath(`/shop/${existing.slug}`);

  return NextResponse.json({ ok: true as const });
}
