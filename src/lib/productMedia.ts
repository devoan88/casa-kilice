import { assetUrl } from "@/lib/assetUrl";

/**
 * Product stills: SVG placeholders ship in repo.
 *
 * If you drop real photos into `public/products/` you can enable them per-asset
 * via `RASTER_BASES`. This avoids broken images when only some tones/parts are
 * available as JPEG.
 */
export const RASTER_BASES = new Set<string>([
  // Found in public/products as customer-provided files (renamed to .jpg)
  "light-cream",
  "bronzer-cream",
  "deep-cream",
  "packaging",
  // Add these when you drop them:
  // "light-powder",
  // "bronzer-powder",
  // "deep-powder",
]);

export function productAssetPath(base: string): string {
  return `/products/${base}.${RASTER_BASES.has(base) ? "jpg" : "svg"}`;
}

export function productRasterUrl(base: string): string | null {
  return RASTER_BASES.has(base) ? assetUrl(`/products/${base}.jpg`) : null;
}
