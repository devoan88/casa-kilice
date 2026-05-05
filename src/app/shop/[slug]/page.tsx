import { notFound } from "next/navigation";

import { ProductDetailMain } from "@/app/shop/ProductDetailMain";
import { ProductDetailNav } from "@/app/shop/ProductDetailNav";
import { ProductGallery } from "@/components/ProductGallery";
import { catalog } from "@/lib/catalog";
import { ensureCatalog } from "@/lib/ensureCatalog";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { productDefs } from "@/lib/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = productDefs.find((p) => p.slug === slug);
  if (!def) return notFound();

  const buyImageSrc = def.media[0]?.src ?? "";

  try {
    await ensureCatalog();
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product || !product.isActive) return notFound();

    const priceLabel = formatMoney(product.priceCents, product.currency);

    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <ProductDetailNav priceLabel={priceLabel} />

        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <ProductGallery galleryKey={product.slug} media={def.media} />

          <ProductDetailMain
            slug={product.slug}
            productName={product.name}
            priceGel={product.priceCents / 100}
            imageSrc={buyImageSrc}
          />
        </div>
      </div>
    );
  } catch (err) {
    console.error("[shop/pdp] database unavailable — static product view", err);
    const cat = catalog.find((c) => c.slug === slug);
    if (!cat) return notFound();
    const priceLabel = formatMoney(cat.priceCents, cat.currency);

    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <p className="mb-6 rounded-2xl border border-[color:color-mix(in_srgb,var(--hermes)_25%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_90%,transparent)] px-4 py-3 text-sm text-muted">
          Offline catalog view — checkout reconnects when the local database loads.
        </p>
        <ProductDetailNav priceLabel={priceLabel} />

        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <ProductGallery galleryKey={slug} media={def.media} />

          <ProductDetailMain
            slug={slug}
            productName={cat.name}
            priceGel={cat.priceCents / 100}
            imageSrc={buyImageSrc}
          />
        </div>
      </div>
    );
  }
}
