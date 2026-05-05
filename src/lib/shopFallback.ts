import { catalog } from "@/lib/catalog";
import type { ShopProductLite } from "@/lib/shopTypes";
import { productDefs } from "@/lib/products";

/** Static catalog when SQLite / Prisma is unavailable (e.g. better-sqlite3 ABI mismatch). */
export function shopProductsFromCatalog(): ShopProductLite[] {
  return catalog.map((c) => {
    const def = productDefs.find((d) => d.slug === c.slug);
    return {
      id: `static-${c.slug}`,
      slug: c.slug,
      name: c.name,
      subtitle: def?.subtitle ?? "",
      tone: def?.tone ?? "light",
      priceCents: c.priceCents,
      currency: c.currency,
      imageUrl: c.imageUrl ?? null,
    };
  });
}
