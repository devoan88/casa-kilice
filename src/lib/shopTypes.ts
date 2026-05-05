import type { ProductTone } from "@/lib/products";

export type ShopProductLite = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  tone: ProductTone;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
};
