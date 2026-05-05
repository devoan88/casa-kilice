"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { AssetSvg } from "@/components/AssetSvg";
import { HeroToneSlider } from "@/components/home/HeroToneSlider";
import { assetUrl } from "@/lib/assetUrl";
import { DUAL_TEXTURE_PALETTE } from "@/lib/dualTexturePalette";
import { useI18n } from "@/i18n/LanguageProvider";
import { productAssetPath, productRasterUrl } from "@/lib/productMedia";
import type { ProductTone } from "@/lib/products";
import { productDefs } from "@/lib/products";
import type { PublicSiteContent } from "@/lib/siteContent";

const fullHeroType = "text-[color:var(--espresso)] transition-colors duration-500";

/** Viewport minus QuietHeader (~3rem) so first paint fits one screen. */
const foldH =
  "h-[calc(100dvh-3rem)] max-h-[calc(100dvh-3rem)] min-h-0 sm:h-[calc(100dvh-3.25rem)] sm:max-h-[calc(100dvh-3.25rem)] md:h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-3.5rem)]";

export function TextureScrollReveal({ hero }: { hero?: PublicSiteContent | null }) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [heroTone, setHeroTone] = useState<ProductTone>("light");

  const activeDef = productDefs.find((p) => p.tone === heroTone) ?? productDefs[0]!;

  const packagingPath = productAssetPath("packaging");
  const bottleImgSrc = productRasterUrl("packaging") ?? assetUrl(packagingPath);
  const customHeroUrl = hero?.homeHeroImageUrl?.trim() || null;
  const bottleIsRaster = customHeroUrl ? true : packagingPath.endsWith(".jpg");
  const bottleDisplaySrc = customHeroUrl ?? bottleImgSrc;

  const scrollOffset = useMemo((): ["start start", "end end"] => ["start start", "end end"], []);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: scrollOffset,
  });

  /** Opacity only — avoid stacking `scale`/`y` on parent so tone slide CSS transform always runs. */
  const dualOpacity = useTransform(scrollYProgress, [0, 0.34], [1, 0]);

  const bottleOpacity = useTransform(scrollYProgress, [0.2, 0.46], [0, 1]);
  const bottleScale = useTransform(scrollYProgress, [0.22, 0.5], [0.82, 1]);
  const bottleY = useTransform(scrollYProgress, [0.22, 0.48], ["6%", "0%"]);
  /** Invisible bottle layer must not steal clicks from the tone slider (z was above textures). */
  const bottlePointerEvents = useTransform(bottleOpacity, (o) => (o < 0.04 ? "none" : "auto"));

  const metaOpacity = useTransform(scrollYProgress, [0.56, 0.74], [0, 1]);
  const metaY = useTransform(scrollYProgress, [0.56, 0.76], [28, 0]);
  const metaPointerEvents = useTransform(metaOpacity, (o) => (o < 0.04 ? "none" : "auto"));

  const dividerOpacity = useTransform(scrollYProgress, [0.32, 0.5], [1, 0]);

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  const dualLayerRef = useRef<HTMLDivElement | null>(null);
  // Do NOT depend on `dualOpacity` — framer may give a new identity some renders,
  // which retriggered layout and froze the tab ("Maximum update depth" / layout thrash).
  useLayoutEffect(() => {
    const el = dualLayerRef.current;
    if (el) el.style.opacity = String(dualOpacity.get());
  }, []);
  useMotionValueEvent(dualOpacity, "change", (v) => {
    const el = dualLayerRef.current;
    if (el) el.style.opacity = String(v);
  });

  const priceUsd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(18);

  return (
    <div
      ref={containerRef}
      className="relative h-[220vh] md:h-[260vh]"
      aria-label={`${t("home_wordmark_section_aria")} · ${t("home_scroll_story_aria")}`}
    >
      <div
        className={[
          "sticky top-0 z-0 flex w-full flex-col overflow-x-clip overflow-y-visible bg-[color:var(--sand)] px-3 pb-1 pt-0 md:px-5",
          foldH,
        ].join(" ")}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_50%_45%,transparent_20%,color-mix(in_srgb,var(--sand-deeper)_18%,transparent)_100%)]"
          aria-hidden
        />

        <div
          className="relative z-[25] flex shrink-0 flex-col items-center gap-1.5 px-2 pt-1 md:gap-2"
          role="region"
          aria-label={t("home_wordmark_section_aria")}
        >
          <Link
            href="/"
            className="inline-block max-w-[104px] shrink-0 sm:max-w-[112px] md:max-w-[120px]"
            aria-label="Casa Kilicé — home"
          >
            <span className="sr-only">Casa Kilicé</span>
            <img
              src={assetUrl("/assets/casa-kilicepublicbrandlogo.svg.jpeg")}
              alt=""
              decoding="async"
              className="mx-auto block h-auto w-full"
            />
          </Link>
          <p className="max-w-[min(100%,26rem)] text-center font-[family-name:var(--font-georgian)] text-[13px] font-medium leading-snug tracking-[0.04em] text-[#3C3530] md:max-w-[32rem] md:text-[15px] md:leading-relaxed">
            {t("home_fold_manifesto")}
          </p>
          <p className="line-clamp-3 max-w-[min(100%,26rem)] text-center font-[family-name:var(--font-display)] text-[12px] font-medium leading-[1.55] tracking-[0.02em] text-[#3C3530] md:max-w-[32rem] md:text-[14px] md:leading-[1.6]">
            {t("site_rail_membership")}
          </p>
        </div>

        <div
          ref={dualLayerRef}
          className="relative z-[2] flex min-h-0 flex-1 flex-col justify-center py-0.5"
          style={{ opacity: 1, willChange: "opacity" }}
        >
          <HeroToneSlider heroTone={heroTone} onToneChange={setHeroTone} dividerOpacity={dividerOpacity} compact />
        </div>

        <motion.p
          style={{ opacity: scrollHintOpacity }}
          className="pointer-events-none relative z-[25] shrink-0 pb-1 text-center font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,#3C3530_55%,transparent)] md:text-[11px]"
          aria-hidden
        >
          {t("home_fold_membership_hint")}
        </motion.p>

        <motion.div
          style={{
            opacity: bottleOpacity,
            scale: bottleScale,
            y: bottleY,
            pointerEvents: bottlePointerEvents,
          }}
          className="absolute inset-0 z-[3] flex flex-col items-center justify-center px-4"
        >
          <div className="relative aspect-[3/4] w-full max-w-[min(88vw,360px)] md:max-w-[420px]">
            <div
              className="relative h-full w-full min-h-[200px] overflow-hidden rounded-[clamp(1.25rem,3vw,1.75rem)] border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] shadow-[inset_0_0_80px_rgba(255,252,248,0.28),0_24px_60px_rgba(45,27,27,0.08)]"
              style={{ backgroundColor: DUAL_TEXTURE_PALETTE.packagingSand }}
            >
              {bottleIsRaster ? (
                <img
                  src={bottleDisplaySrc}
                  alt={activeDef.name}
                  width={840}
                  height={1120}
                  className="relative z-[1] h-full w-full object-cover p-0"
                  decoding="async"
                />
              ) : (
                <AssetSvg
                  src={packagingPath}
                  alt={activeDef.name}
                  className="relative z-[1] h-full w-full object-cover p-0"
                  fit="slice"
                />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: metaOpacity, y: metaY, pointerEvents: metaPointerEvents }}
          className="absolute bottom-[max(2rem,7vh)] left-0 right-0 z-[4] mx-auto flex max-w-lg flex-col items-center gap-4 px-6 text-center"
        >
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[color:var(--espresso)] transition-colors duration-500 md:text-3xl">
            {activeDef.name}
          </p>
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.26em] text-muted md:text-xs">
            {activeDef.subtitle}
          </p>
          <p className="text-sm tracking-[0.12em] text-muted transition-colors duration-500">
            {activeDef.priceGel} GEL · {priceUsd}
          </p>
          <div className="w-full max-w-md border-t border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] pt-4">
            <p className={["text-[10px] font-medium uppercase tracking-[0.32em]", fullHeroType].join(" ")}>
              {t("home_ingredients_kicker")}
            </p>
            <p className="mt-3 text-left text-xs leading-relaxed text-muted transition-colors duration-500">
              {t("home_ingredients_body")}
            </p>
          </div>
          <Link
            href={`/shop/${activeDef.slug}`}
            prefetch
            className={["text-[10px] font-medium uppercase tracking-[0.32em] underline-offset-4 hover:underline", fullHeroType].join(
              " ",
            )}
          >
            {t("home_view_product")}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
