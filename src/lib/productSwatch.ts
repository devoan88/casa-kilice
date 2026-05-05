import { assetUrl } from "@/lib/assetUrl";
import type { ProductTone } from "@/lib/products";

/** Solid swatch JPEGs from `npm run swatches` (derived from your product photos). */
export function toneSwatchUrl(tone: ProductTone, part: "cream" | "powder"): string {
  return assetUrl(`/products/swatches/${tone}-${part}.jpg`);
}
