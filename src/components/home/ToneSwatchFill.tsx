"use client";

import type { ProductTone } from "@/lib/products";
import { TONE_SWATCH_HEX } from "@/lib/toneSwatches.generated";

/** Inline backup — circles stay filled even if generated file is missing/out of sync. */
const STATIC_HEX: Record<ProductTone, Record<"cream" | "powder", string>> = {
  light: { powder: "#C9A780", cream: "#A67344" },
  bronzer: { powder: "#A3785E", cream: "#7B4B32" },
  deep: { powder: "#6F4632", cream: "#4A2C1D" },
};

const FALLBACK = "#b07852";

/**
 * Solid filled disc — always paints a real color (from your product photos via
 * `npm run swatches` → `toneSwatches.generated.ts`). No network image: cannot render “empty”.
 */
export function ToneSwatchFill({
  tone,
  part,
  className,
  sizePx,
}: {
  tone: ProductTone;
  part: "cream" | "powder";
  className?: string;
  /** Square size in CSS pixels (width = height). */
  sizePx: number;
}) {
  const row = TONE_SWATCH_HEX[tone];
  /** Curated pairings (authoritative) — generated swatches stay as fallback only. */
  const bg = STATIC_HEX[tone]?.[part] ?? row?.[part] ?? FALLBACK;

  const finish = part === "powder" ? "matte" : "glossy";
  const finishClass =
    finish === "matte"
      ? "shadow-[inset_0_3px_10px_rgba(0,0,0,0.22),inset_0_-1px_0_rgba(255,255,255,0.05)]"
      : "shadow-[inset_0_-18px_32px_rgba(255,255,255,0.28),inset_0_10px_22px_rgba(255,255,255,0.38),0_6px_18px_rgba(45,27,27,0.1)]";

  return (
    <div
      className={[
        "shrink-0 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_16%,transparent)]",
        finishClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: sizePx,
        minWidth: sizePx,
        height: sizePx,
        minHeight: sizePx,
        backgroundColor: bg,
      }}
    />
  );
}
