"use client";

import { useState } from "react";

import { DualTextureCreamDisc, DualTexturePowderDisc } from "@/components/home/DualTextureSwatchDisc";
import { DUAL_TEXTURE_PALETTE } from "@/lib/dualTexturePalette";
import type { ProductTone } from "@/lib/products";
import { TRIO_TONE_TEXTURE } from "@/lib/trioTonePalettes";
import { useI18n } from "@/i18n/LanguageProvider";

const studioWash =
  "linear-gradient(128deg, rgba(255,252,248,0.5) 0%, rgba(255,250,246,0.16) 36%, transparent 54%, rgba(255,188,130,0.14) 76%, rgba(255,155,88,0.16) 100%)";

/**
 * Dual powder + cream preview for shop / PDP — uses trio tone hexes. Parent should use `group` for hover labels.
 */
export function CatalogToneDuoVisual({
  tone,
  variant = "gallery",
  labelVisibility = "hover",
  className,
}: {
  tone: ProductTone;
  variant?: "gallery" | "card";
  labelVisibility?: "hover" | "always";
  className?: string;
}) {
  const { t } = useI18n();
  const [creamLit, setCreamLit] = useState(false);
  const { powder, cream } = TRIO_TONE_TEXTURE[tone];
  const powderPx = variant === "card" ? 102 : 118;
  const creamPx = variant === "card" ? 102 : 122;
  const labelBase =
    "pointer-events-none text-[9px] font-medium uppercase tracking-[0.32em] text-[color:color-mix(in_srgb,var(--espresso)_78%,transparent)] transition-opacity duration-500 ease-out";
  const labelShow =
    labelVisibility === "always" ? "opacity-90" : "opacity-0 group-hover:opacity-100";

  return (
    <div
      className={[
        "relative isolate flex h-full min-h-[8rem] w-full flex-col items-center justify-center overflow-hidden bg-[color:var(--sand)] px-4 py-6 md:flex-row md:gap-8 md:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => setCreamLit(true)}
      onMouseLeave={() => setCreamLit(false)}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: studioWash,
          boxShadow:
            "inset 0 0 100px rgba(255,252,248,0.35), inset 0 -24px 48px rgba(42,26,18,0.04)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 42%, transparent 30%, color-mix(in srgb, ${DUAL_TEXTURE_PALETTE.packagingSand} 55%, transparent) 100%)`,
        }}
        aria-hidden
      />

      <div className="relative z-[1] flex flex-col items-center gap-2 md:gap-2.5">
        <DualTexturePowderDisc sizePx={powderPx} baseColor={powder} />
        <span className={[labelBase, labelShow].join(" ")}>{t("home_texture_powder")}</span>
      </div>

      <div
        className="relative z-[1] mx-2 hidden h-16 w-px shrink-0 bg-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] md:block"
        aria-hidden
      />
      <div className="relative z-[1] my-2 h-px w-12 shrink-0 bg-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] md:hidden" aria-hidden />

      <div className="relative z-[1] flex flex-col items-center gap-2 md:gap-2.5">
        <DualTextureCreamDisc
          sizePx={creamPx}
          baseColor={cream}
          tone={tone}
          sheenActive={creamLit}
        />
        <span className={[labelBase, labelShow].join(" ")}>{t("home_texture_cream")}</span>
      </div>
    </div>
  );
}
