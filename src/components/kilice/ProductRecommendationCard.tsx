import Image from "next/image";

import { AssetSvg } from "@/components/AssetSvg";
import type { ProductVisualKit } from "@/lib/skinScan/productVisuals";

function isRasterPath(src: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(src);
}

export function ProductRecommendationCard({
  recName,
  recNote,
  kit,
  variant,
}: {
  recName: string;
  recNote: string;
  kit: ProductVisualKit;
  variant: "light" | "dark";
}) {
  const shell =
    variant === "dark"
      ? "border-[color:color-mix(in_srgb,var(--hermes)_42%,transparent)] bg-[#080706] shadow-[0_32px_90px_rgba(0,0,0,0.45)]"
      : "border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,#fff_98%,var(--sand))] shadow-[0_24px_70px_rgba(45,27,27,0.08)]";
  const heroGrad =
    variant === "dark"
      ? "from-[#060504] via-transparent to-transparent opacity-90"
      : "from-[color-mix(in_srgb,var(--espresso)_88%,#fff)] via-transparent to-transparent opacity-85";
  const titleClass =
    variant === "dark"
      ? "text-[color:var(--sand-soft)]"
      : "text-[color:var(--espresso)]";
  const bodyClass =
    variant === "dark"
      ? "text-[color:color-mix(in_srgb,var(--sand)_78%,transparent)]"
      : "text-[color:color-mix(in_srgb,var(--espresso)_72%,#333)]";
  const kickerClass =
    variant === "dark"
      ? "text-[color:color-mix(in_srgb,var(--sand)_70%,var(--hermes))]"
      : "text-[color:color-mix(in_srgb,var(--espresso)_55%,#555)]";

  return (
    <article className={`overflow-hidden rounded-[28px] border ${shell}`}>
      <div className="relative aspect-[21/9] min-h-[200px] w-full sm:aspect-[24/9]">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${heroGrad}`} aria-hidden />
        {isRasterPath(kit.heroImage) ? (
          <Image
            src={kit.heroImage}
            alt={kit.altHero}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            quality={96}
            className="object-cover"
            priority
          />
        ) : (
          <AssetSvg src={kit.heroImage} alt={kit.altHero} className="absolute inset-0 h-full w-full" fit="slice" />
        )}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <p className={`text-[9px] font-semibold uppercase tracking-[0.32em] ${kickerClass}`}>Casa Kilicé · Editorial pick</p>
          <h3
            className={`mt-2 max-w-xl font-[family-name:var(--font-display)] text-[clamp(1.5rem,4vw,2.25rem)] font-medium tracking-tight ${titleClass}`}
          >
            {recName}
          </h3>
          <p className={`mt-2 max-w-lg text-sm leading-relaxed ${bodyClass}`}>{recNote}</p>
        </div>
      </div>

      <div className="grid gap-0 border-t border-[color:color-mix(in_srgb,var(--hermes)_25%,transparent)] md:grid-cols-2">
        <div className="border-b border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] p-5 md:border-b-0 md:border-r">
          <p className="text-[8px] uppercase tracking-[0.28em] text-[color:color-mix(in_srgb,var(--sand)_45%,transparent)]">
            Powder
          </p>
          <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,var(--hermes)_30%,transparent)] bg-[#12100e]">
            {isRasterPath(kit.powderSwatch) ? (
              <Image
                src={kit.powderSwatch}
                alt={kit.altPowderTexture}
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                quality={93}
                className="object-cover"
              />
            ) : (
              <AssetSvg src={kit.powderSwatch} alt={kit.altPowderTexture} className="absolute inset-0 h-full w-full" fit="slice" />
            )}
          </div>
        </div>
        <div className="p-5">
          <p className="text-[8px] uppercase tracking-[0.28em] text-[color:color-mix(in_srgb,var(--sand)_45%,transparent)]">
            Cream
          </p>
          <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,var(--hermes)_30%,transparent)] bg-[#12100e]">
            {isRasterPath(kit.creamSwatch) ? (
              <Image
                src={kit.creamSwatch}
                alt={kit.altCreamTexture}
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                quality={93}
                className="object-cover"
              />
            ) : (
              <AssetSvg src={kit.creamSwatch} alt={kit.altCreamTexture} className="absolute inset-0 h-full w-full" fit="slice" />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
