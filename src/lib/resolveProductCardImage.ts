import { productAssetPath } from "@/lib/productMedia";
import { productDefs } from "@/lib/products";

const CATALOG_SLUGS = new Set(productDefs.map((p) => p.slug));

function fallbackSrcForSlug(slug: string): string {
  const d = productDefs.find((x) => x.slug === slug);
  return d?.media[0]?.src ?? productAssetPath("packaging");
}

/**
 * Picks a safe image for shop cards. Prefer local catalog media for known
 * slugs when the DB still has stale JPEGs or external URLs.
 */
export function resolveProductCardImage(slug: string, imageUrl: string | null | undefined): string {
  const fallback = fallbackSrcForSlug(slug);
  const raw = (imageUrl ?? "").trim();
  if (!raw) return fallback;
  if (/\.(jpe?g)(\?|$)/i.test(raw)) return fallback;
  if (CATALOG_SLUGS.has(slug) && /^https?:\/\//i.test(raw)) return fallback;
  return raw;
}
