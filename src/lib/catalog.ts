export type CatalogProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: "GEL";
  imageUrl?: string;
};

import { productDefs, priceCentsFromGel } from "@/lib/products";

export const catalog: CatalogProduct[] = productDefs.map((p) => ({
  slug: p.slug,
  name: p.name,
  description: p.description,
  priceCents: priceCentsFromGel(p.priceGel),
  currency: "GEL",
  imageUrl: p.media[0]?.src,
}));

