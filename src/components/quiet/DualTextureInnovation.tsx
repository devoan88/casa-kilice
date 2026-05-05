"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AssetSvg } from "@/components/AssetSvg";
import { productAssetPath } from "@/lib/productMedia";
import { EditorialReveal } from "@/components/quiet/EditorialReveal";
import { useI18n } from "@/i18n/LanguageProvider";

const LIQUID = {
  duration: 1.15,
  ease: [0.45, 0, 0.55, 1] as const,
};

const MACRO_SLIDES = [
  { src: productAssetPath("light-powder"), key: "powder" as const },
  { src: productAssetPath("light-cream"), key: "cream" as const },
];

/** Thin espresso call-out: elbow line pointing toward the compact. */
function CalloutElbow({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 72 56"
      className={[
        "h-14 w-[4.5rem] shrink-0 text-[color:var(--espresso)] md:h-[4.5rem] md:w-[5.5rem]",
        flip ? "scale-x-[-1]" : "",
      ].join(" ")}
      aria-hidden
    >
      <path
        d="M 4 6 H 52 V 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function LiquidMacroSlider() {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const n = MACRO_SLIDES.length;

  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % n), 6500);
    return () => window.clearInterval(id);
  }, [n]);

  const go = (d: number) => setI((v) => (v + d + n * 4) % n);
  const slide = MACRO_SLIDES[i]!;

  return (
    <div className="relative min-h-[min(72vh,640px)] w-full overflow-hidden bg-[color:var(--sand-carved)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_40%,color-mix(in_srgb,var(--sand-soft)_35%,transparent),transparent)]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.key}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.995 }}
          transition={LIQUID}
          className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
        >
          <div className="relative h-full w-full max-w-5xl">
            <AssetSvg
              src={slide.src}
              alt=""
              className="absolute inset-0 m-auto h-full w-full max-h-full max-w-full object-cover"
              fit="slice"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="pointer-events-none absolute bottom-10 left-1/2 z-[2] -translate-x-1/2 text-center text-[10px] font-medium uppercase tracking-[0.42em] text-[color:color-mix(in_srgb,var(--espresso)_55%,transparent)]">
        {slide.key === "powder" ? t("dual_slide_powder_caption") : t("dual_slide_cream_caption")}
      </p>

      <div className="absolute bottom-10 left-5 z-[3] flex gap-2 md:left-10">
        <button
          type="button"
          aria-label="Previous texture"
          onClick={() => go(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--sand-soft)_55%,transparent)] text-[color:var(--espresso)] backdrop-blur-sm transition-colors duration-500 hover:bg-[color:color-mix(in_srgb,var(--sand-soft)_88%,transparent)]"
        >
          <ChevronLeft size={20} strokeWidth={1.25} />
        </button>
        <button
          type="button"
          aria-label="Next texture"
          onClick={() => go(1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--sand-soft)_55%,transparent)] text-[color:var(--espresso)] backdrop-blur-sm transition-colors duration-500 hover:bg-[color:color-mix(in_srgb,var(--sand-soft)_88%,transparent)]"
        >
          <ChevronRight size={20} strokeWidth={1.25} />
        </button>
      </div>
    </div>
  );
}

export function DualTextureInnovation() {
  const { t } = useI18n();

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-[min(80px,12vw)] w-screen border-y border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] bg-[color:var(--sand-raised)] py-[clamp(3.5rem,9vw,7rem)]"
      aria-labelledby="dual-texture-heading"
    >
      <EditorialReveal className="mx-auto max-w-3xl px-5 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-muted">
          {t("dual_section_kicker")}
        </p>
        <h2
          id="dual-texture-heading"
          className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.12] tracking-tight text-[color:var(--espresso)]"
        >
          {t("dual_section_title")}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted md:text-base">
          {t("dual_section_body")}
        </p>
      </EditorialReveal>

      {/* Packshot + espresso call-outs to the two windows */}
      <EditorialReveal delay={0.08} className="relative mx-auto mt-14 max-w-4xl px-5 md:mt-20">
        <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-center md:gap-4 lg:gap-8">
          {/* Powdery — left */}
          <div className="order-2 flex w-full max-w-[11rem] flex-col items-center md:order-1 md:items-end md:pt-10">
            <div className="flex flex-row items-end gap-2 md:flex-row-reverse">
              <CalloutElbow />
              <div className="pb-1 text-right">
                <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[color:var(--espresso)]">
                  {t("dual_powdery_label")}
                </p>
                <p className="mt-2 text-[11px] font-medium tracking-[0.12em] text-muted">
                  {t("dual_powdery_ka")}
                </p>
              </div>
            </div>
          </div>

          <div className="relative order-1 aspect-[4/5] w-full max-w-[min(100%,320px)] md:order-2 md:max-w-[360px]">
            <AssetSvg
              src={productAssetPath("packaging")}
              alt=""
              className="h-auto w-full object-cover"
              fit="slice"
            />
          </div>

          {/* Creamy — right */}
          <div className="order-3 flex w-full max-w-[11rem] flex-col items-center md:items-start md:pt-10">
            <div className="flex flex-row items-end gap-2">
              <div className="pb-1 text-left">
                <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[color:var(--espresso)]">
                  {t("dual_creamy_label")}
                </p>
                <p className="mt-2 text-[11px] font-medium tracking-[0.12em] text-muted">
                  {t("dual_creamy_ka")}
                </p>
              </div>
              <CalloutElbow flip />
            </div>
          </div>
        </div>
      </EditorialReveal>

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 w-screen md:mt-24">
        <LiquidMacroSlider />
      </div>
    </section>
  );
}
