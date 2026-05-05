import { ShopPageClient } from "@/app/shop/ShopPageClient";
import type { ShopProductLite } from "@/lib/shopTypes";
import { ensureCatalog } from "@/lib/ensureCatalog";
import { prisma } from "@/lib/prisma";
import { productDefs } from "@/lib/products";
import { shopProductsFromCatalog } from "@/lib/shopFallback";

export default async function ShopPage() {
  try {
    await ensureCatalog();
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const lite: ShopProductLite[] = products.map((p) => {
      const def = productDefs.find((d) => d.slug === p.slug);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        subtitle: def?.subtitle ?? "",
        tone: def?.tone ?? "light",
        priceCents: p.priceCents,
        currency: p.currency,
        imageUrl: p.imageUrl,
      };
    });

    return <ShopPageClient products={lite} />;
  } catch (err) {
    console.error("[shop] database unavailable — using static catalog", err);
    return <ShopPageClient products={shopProductsFromCatalog()} staticCatalogNotice />;
  }
}
