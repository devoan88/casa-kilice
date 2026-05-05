import { productAssetPath } from "@/lib/productMedia";

export type ProductTone = "light" | "bronzer" | "deep";
export type ProductPart = "cream" | "powder";

export type ProductMedia = {
  src: string;
  alt: string;
  tag?: string;
  /** Renders CSS duo (tone-matched textures) instead of `src` for this slide. */
  duoRenderTone?: ProductTone;
};

export type ProductDefinition = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  tone: ProductTone;
  priceGel: number;
  media: ProductMedia[];
};

export const productDefs: ProductDefinition[] = [
  {
    slug: "luminous-ivory-duo",
    name: "LIGHT TONE",
    subtitle: "Setting + Glow",
    description:
      "Setting + Glow — powdery setting: Deep Toasted Wheat matte powder for soft blur and long wear. Creamy glow: Bronze Glow cream with a rich, specular finish. One couture compact; two finishes.",
    tone: "light",
    priceGel: 65,
    media: [
      {
        src: productAssetPath("packaging"),
        alt: "Light tone — powder and cream duo",
        duoRenderTone: "light",
      },
      {
        src: productAssetPath("packaging"),
        alt: "Casa Kilicé packaging",
        tag: "Packaging",
      },
    ],
  },
  {
    slug: "soleil-bronze-duo",
    name: "BRONZER TONE",
    subtitle: "Sunkissed + Glow",
    description:
      "Sunkissed + Glow — warm terracotta powder (#A3785E) for sun-washed depth and bronze cream (#7B4B32) with a satin-gloss sculpt. One compact; two finishes.",
    tone: "bronzer",
    priceGel: 65,
    media: [
      {
        src: productAssetPath("packaging"),
        alt: "Bronzer tone — powder and cream duo",
        duoRenderTone: "bronzer",
      },
      {
        src: productAssetPath("packaging"),
        alt: "Casa Kilicé packaging",
        tag: "Packaging",
      },
    ],
  },
  {
    slug: "velvet-noir-duo",
    name: "DEEP TONE",
    subtitle: "Rich Sculpt + Glow",
    description:
      "Rich Sculpt + Glow — espresso-walnut powder (#6F4632) for velvety depth and molten cocoa cream (#4A2C1D) with an ultra-rich specular glow. One compact; two finishes.",
    tone: "deep",
    priceGel: 65,
    media: [
      {
        src: productAssetPath("packaging"),
        alt: "Deep tone — powder and cream duo",
        duoRenderTone: "deep",
      },
      {
        src: productAssetPath("packaging"),
        alt: "Casa Kilicé packaging",
        tag: "Packaging",
      },
    ],
  },
];

export function priceCentsFromGel(gel: number) {
  return Math.round(gel * 100);
}
