"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { SpatialCard } from "@/components/portal/SpatialCard";
import { ParallaxFloat } from "@/components/portal/ParallaxScene";
import { ToneSwatchFill } from "@/components/home/ToneSwatchFill";
import { assetUrl } from "@/lib/assetUrl";
import { useI18n } from "@/i18n/LanguageProvider";
import { productAssetPath, productRasterUrl } from "@/lib/productMedia";
import type { ProductTone } from "@/lib/products";

// Dynamic import — Three.js / WebGL must NOT run on the server
const ProductScene3D = dynamic(
  () => import("@/components/portal/ProductScene3D").then((m) => m.ProductScene3D),
  { ssr: false, loading: () => null },
);

type Row = {
  tone: ProductTone;
  slug: string;
  title: string;
  tagline: string;
  imageBase: "light-cream" | "bronzer-cream" | "deep-cream";
};

const ROW: Row[] = [
  {
    tone: "light",
    slug: "luminous-ivory-duo",
    title: "LIGHT TONE",
    tagline: "SETTING + GLOW",
    imageBase: "light-cream",
  },
  {
    tone: "bronzer",
    slug: "soleil-bronze-duo",
    title: "BRONZER TONE",
    tagline: "SUNKISSED + GLOW",
    imageBase: "bronzer-cream",
  },
  {
    tone: "deep",
    slug: "velvet-noir-duo",
    title: "DEEP TONE",
    tagline: "RICH SCULPT + GLOW",
    imageBase: "deep-cream",
  },
];

function creamHeroSrc(base: Row["imageBase"]): string {
  return productRasterUrl(base) ?? assetUrl(productAssetPath(base));
}

// Build product defs for 3D scene
const PRODUCT_3D = ROW.map((r, i) => ({
  slug: r.slug,
  title: r.title,
  tagline: r.tagline,
  imageUrl: `/products/${r.imageBase}.jpg`,
  position: [(i - 1) * 2.6, 0, (i === 1 ? 0.6 : 0)] as [number, number, number],
}));

const cardAnim = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export function HomeProductFilmstrip() {
  const { t } = useI18n();
  const [enable3D, setEnable3D] = useState(false);

  useEffect(() => {
    // Mobile performance: only enable WebGL on md+ and when user isn't in data-saver.
    const mq = window.matchMedia("(min-width: 768px)");
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const saveData = Boolean(nav.connection?.saveData);

    const compute = () => setEnable3D(mq.matches && !saveData);
    compute();

    mq.addEventListener?.("change", compute);
    return () => mq.removeEventListener?.("change", compute);
  }, []);

  return (
    <section
      id="casa-shop-the-look"
      className="relative scroll-mt-[4.5rem] overflow-hidden border-t border-[color:rgba(255,255,255,0.05)] bg-[#050403] pb-20 pt-12 md:scroll-mt-24"
      aria-labelledby="home-filmstrip-heading"
    >
      {/* Depth haze */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(232,196,92,0.08) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(232,196,92,0.04) 0%, transparent 55%)",
        }}
      />

      {/* Section header */}
      <div className="relative z-10 mx-auto max-w-6xl px-5 md:px-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.42em] text-[color:rgba(232,196,92,0.65)]">
          {t("home_filmstrip_kicker")}
        </p>
        <ParallaxFloat strength={0.15}>
          <h2
            id="home-filmstrip-heading"
            className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:rgba(245,240,234,0.92)] md:text-2xl"
          >
            {t("home_filmstrip_title")}
          </h2>
        </ParallaxFloat>
      </div>

      {/* ── 3D WebGL Scene ── */}
      <div className="relative z-10 mx-auto mt-6 max-w-6xl px-5 md:px-8">
        {enable3D ? (
          <ProductScene3D products={PRODUCT_3D} className="h-[340px] w-full rounded-[32px] md:h-[460px]" />
        ) : (
          <div className="ck-spatial-panel relative h-[240px] w-full rounded-[32px] md:h-[320px]">
            <div
              className="absolute inset-0 rounded-[inherit] opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(232,196,92,0.10), transparent 60%)",
              }}
              aria-hidden
            />
            <div className="relative flex h-full items-center justify-center px-8 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:rgba(232,196,92,0.7)]">
                Spatial scene loads on larger screens
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Spatial Glass Card Grid (2D fallback + detail) ── */}
      <motion.div
        className="relative z-10 mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-7 px-5 sm:grid-cols-3 md:px-8"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        style={{ perspective: "1400px" }}
      >
        {ROW.map((row) => (
          <motion.div key={row.slug} variants={cardAnim}>
            <Link href={`/shop/${row.slug}`} prefetch className="group block">
              <SpatialCard depthZ={row.tone === "bronzer" ? 18 : 0} glowStrength={1.1}>
                {/* Full-bleed product image */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[28px]">
                  <img
                    src={creamHeroSrc(row.imageBase)}
                    alt={row.title}
                    width={640}
                    height={800}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Bottom gradient fade */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(14,12,10,0.92)] to-transparent" />
                </div>

                {/* Info panel */}
                <div className="px-5 pb-5 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-[15px] font-medium tracking-[0.1em] text-[color:rgba(245,240,234,0.95)]">
                        {row.title}
                      </p>
                      <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-[color:rgba(232,196,92,0.68)]">
                        {row.tagline}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToneSwatchFill tone={row.tone} part="powder" sizePx={28} />
                      <ToneSwatchFill tone={row.tone} part="cream" sizePx={28} />
                    </div>
                  </div>

                  {/* Eye-tracking CTA — reveals on hover */}
                  <div className="mt-4 flex items-center gap-2 opacity-0 transition-all duration-400 group-hover:opacity-100">
                    <div className="h-[1px] flex-1 bg-[color:rgba(232,196,92,0.3)]" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[color:rgba(232,196,92,0.88)]">
                      View →
                    </span>
                  </div>
                </div>
              </SpatialCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <div className="relative z-10 mx-auto mt-10 max-w-6xl px-5 text-center md:px-8">
        <Link
          href="/shop"
          prefetch
          className="ck-eye-hover inline-flex items-center gap-2.5 rounded-full border border-[color:rgba(232,196,92,0.28)] bg-[color:rgba(232,196,92,0.06)] px-8 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[color:rgba(232,196,92,0.88)] shadow-[0_0_0_1px_rgba(232,196,92,0.08),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm"
        >
          {t("nav_shop")} →
        </Link>
      </div>
    </section>
  );
}
