import { catalog } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

/**
 * Seeds catalog products when missing. Does not overwrite existing rows so
 * admin edits (price, images, copy) stay authoritative until changed in the console.
 * One-time bump: legacy 48.00 GEL rows for built-in slugs sync to current catalog cents.
 */
export async function ensureCatalog() {
  await Promise.all(
    catalog.map((p) =>
      prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          slug: p.slug,
          name: p.name,
          description: p.description,
          category: "Duo",
          priceCents: p.priceCents,
          currency: p.currency,
          imageUrl: p.imageUrl,
          isActive: true,
          stock: 100,
        },
      }),
    ),
  );

  const legacyCents = 48 * 100;
  for (const p of catalog) {
    await prisma.product.updateMany({
      where: { slug: p.slug, priceCents: legacyCents },
      data: { priceCents: p.priceCents },
    });
  }
}

