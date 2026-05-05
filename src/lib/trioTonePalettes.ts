import type { ProductTone } from "@/lib/products";

export type TrioToneTexture = {
  powder: string;
  cream: string;
};

/** Hero / catalog / swatches — three distinct tones (powder matte · cream gloss). */
export const TRIO_TONE_TEXTURE: Record<ProductTone, TrioToneTexture> = {
  light: { powder: "#C9A780", cream: "#A67344" },
  bronzer: { powder: "#A3785E", cream: "#7B4B32" },
  deep: { powder: "#6F4632", cream: "#4A2C1D" },
};

export function trioPowderMix(powderHex: string, mixPct: number, sand: string) {
  return `color-mix(in srgb, ${powderHex} ${mixPct}%, ${sand} ${100 - mixPct}%)`;
}
