import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { makeProductSlug } from "@/lib/adminProductSlug";
import { assertCasaAdminApi } from "@/lib/casaAdminApiAuth";
import { prisma } from "@/lib/prisma";
import { priceCentsFromGel } from "@/lib/products";

const imageUrlField = z
  .string()
  .max(2048)
  .optional()
  .transform((s) => {
    const t = s?.trim();
    if (!t) return null;
    return t;
  })
  .refine((s) => s == null || s.startsWith("/") || /^https?:\/\//i.test(s), "Image must be a URL or start with /");

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(12000),
  category: z.string().min(1).max(120),
  priceGel: z.coerce.number().positive().max(1_000_000),
  costGel: z.coerce.number().min(0).max(1_000_000).optional(),
  imageUrl: imageUrlField.optional(),
  stock: z.coerce.number().int().min(0).max(9_999_999).optional(),
});

export async function GET() {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
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

  return NextResponse.json({ ok: true as const, products });
}

export async function POST(req: Request) {
  const auth = await assertCasaAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ ok: false as const, error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, error: "Invalid product." }, { status: 400 });
  }

  const { name, description, category, priceGel, costGel, imageUrl, stock } = parsed.data;
  const slug = makeProductSlug(name);
  const costCents = costGel !== undefined ? priceCentsFromGel(costGel) : 0;

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      description,
      category,
      priceCents: priceCentsFromGel(priceGel),
      costCents,
      currency: "GEL",
      imageUrl,
      isActive: true,
      stock: stock ?? 100,
    },
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
  revalidatePath(`/shop/${product.slug}`);
  revalidatePath("/casa-admin/finance");

  return NextResponse.json({ ok: true as const, product });
}
