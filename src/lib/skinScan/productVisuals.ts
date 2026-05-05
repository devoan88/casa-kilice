import { productAssetPath } from "@/lib/productMedia";

/** Powder macro SVGs in `public/products/`. */
export type PowderSwatchBase = "light-powder" | "bronzer-powder" | "deep-powder";

export type ProductVisualKit = {
  slug: string;
  displayName: string;
  heroImage: string;
  powderSwatch: string;
  creamSwatch: string;
  altHero: string;
  altPowderTexture: string;
  altCreamTexture: string;
};

const SLUG_TO_POWDER: Record<string, PowderSwatchBase> = {
  "luminous-ivory-duo": "light-powder",
  "soleil-bronze-duo": "bronzer-powder",
  "velvet-noir-duo": "deep-powder",
};

const DISPLAY: Record<string, string> = {
  "luminous-ivory-duo": "Casa Kilicé Light Tone Duo",
  "soleil-bronze-duo": "Casa Kilicé Bronzer Tone Duo",
  "velvet-noir-duo": "Casa Kilicé Deep Tone Duo",
};

export function productVisualKit(slug: string): ProductVisualKit {
  const powder = SLUG_TO_POWDER[slug] ?? "light-powder";
  const tone =
    powder === "light-powder" ? "light" : powder === "bronzer-powder" ? "bronzer" : "deep";
  const creamBase = tone === "light" ? "light-cream" : tone === "bronzer" ? "bronzer-cream" : "deep-cream";
  const display = DISPLAY[slug] ?? "Casa Kilicé Duo Compact";
  return {
    slug,
    displayName: display,
    heroImage: productAssetPath(creamBase),
    powderSwatch: productAssetPath(powder),
    creamSwatch: productAssetPath(creamBase),
    altHero: `${display} — open compact hero (cream side)`,
    altPowderTexture: `${display} — fine-milled powder texture swatch`,
    altCreamTexture: `${display} — molten cream texture swatch`,
  };
}
