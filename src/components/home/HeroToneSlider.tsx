"use client";

import { motion, type MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import {
  DualTextureCreamDisc,
  DualTexturePowderDisc,
  DualTexturePowderDustTrail,
} from "@/components/home/DualTextureSwatchDisc";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/LanguageProvider";
import { trackToneViewed } from "@/lib/analytics";
import type { ProductTone } from "@/lib/products";
import { TRIO_TONE_TEXTURE } from "@/lib/trioTonePalettes";

type DualHover = "none" | "powder" | "cream";

const TONE_ORDER = ["light", "bronzer", "deep"] as const satisfies readonly ProductTone[];

const NAV_LABEL: Record<ProductTone, MessageKey> = {
  light: "home_hero_nav_light",
  bronzer: "home_hero_nav_bronzer",
  deep: "home_hero_nav_deep",
};

const SLIDE_HEADLINE: Record<ProductTone, MessageKey> = {
  light: "home_hero_slide_label_light",
  bronzer: "home_hero_slide_label_bronzer",
  deep: "home_hero_slide_label_deep",
};

const DISC_TRANSITION = "transition-all duration-500 ease-in-out";

const softenHeroType =
  "text-[color:color-mix(in_srgb,var(--espresso)_63%,var(--sand)_37%))] transition-colors duration-500";
const fullHeroType = "text-[color:var(--espresso)] transition-colors duration-500";
const captionSans =
  "font-sans text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--espresso)] md:text-[13px] md:tracking-[0.28em]";

const arrowBtnClass =
  "z-[35] flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_22%,transparent)] bg-[color:color-mix(in_srgb,#fff_38%,transparent)] text-[color:var(--espresso)] shadow-[0_8px_28px_rgba(45,27,27,0.12)] backdrop-blur-sm transition hover:bg-[color:color-mix(in_srgb,#fff_58%,transparent)] hover:shadow-[0_12px_36px_rgba(45,27,27,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--espresso)] md:h-16 md:w-16";

const arrowBtnClassCompact =
  "z-[35] flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_22%,transparent)] bg-[color:color-mix(in_srgb,#fff_38%,transparent)] text-[color:var(--espresso)] shadow-[0_6px_20px_rgba(45,27,27,0.1)] backdrop-blur-sm transition hover:bg-[color:color-mix(in_srgb,#fff_58%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--espresso)] md:h-11 md:w-11";

function ToneSlideContent({
  tone,
  powderHex,
  creamHex,
  powderCaption,
  creamCaption,
  dividerOpacity,
  dualHover,
  onHoverChange,
  showHeadline,
  slideHeadline,
  compact,
}: {
  tone: ProductTone;
  powderHex: string;
  creamHex: string;
  powderCaption: string;
  creamCaption: string;
  dividerOpacity: MotionValue<number>;
  dualHover: DualHover;
  onHoverChange: (h: DualHover) => void;
  showHeadline: boolean;
  slideHeadline?: string;
  compact?: boolean;
}) {
  const powderSoft = dualHover === "powder";
  const creamSoft = dualHover === "cream";
  const disc = compact ? 168 : 236;
  const capMt = compact ? "mt-2" : "mt-4";
  const dustPy = compact ? "py-1" : "py-2";
  const outerGap = compact ? "gap-4 md:gap-6" : "gap-8 md:gap-10";
  const rowGap = compact ? "gap-6 md:flex-row md:gap-8 lg:gap-10" : "gap-10 md:flex-row md:gap-12 lg:gap-16";
  const ruleH = compact ? "h-28" : "h-36";
  return (
    <div className={["flex w-full max-w-[960px] flex-col items-center justify-center", outerGap].join(" ")}>
      {showHeadline && slideHeadline ? (
        <p className="max-w-[min(100%,28rem)] text-center font-sans text-[11px] font-medium uppercase leading-relaxed tracking-[0.22em] text-[color:color-mix(in_srgb,var(--espresso)_78%,transparent)] transition-all duration-500 ease-in-out md:text-[12px] md:tracking-[0.26em]">
          {slideHeadline}
        </p>
      ) : null}
      <div className={["flex w-full flex-col items-center justify-center", rowGap].join(" ")} onMouseLeave={() => onHoverChange("none")}>
        <figure
          className="ck-powder-product-window flex w-full max-w-[min(100%,280px)] flex-col items-center md:max-w-[300px]"
          onMouseEnter={() => onHoverChange("powder")}
        >
          <span className="sr-only">{powderCaption}</span>
          <DualTexturePowderDustTrail active={dualHover === "powder"} dustColor={powderHex} className={["flex justify-center", dustPy].join(" ")}>
            <DualTexturePowderDisc sizePx={disc} baseColor={powderHex} className={DISC_TRANSITION} />
          </DualTexturePowderDustTrail>
          <figcaption className={[capMt, "text-center", captionSans, powderSoft ? softenHeroType : fullHeroType, compact ? "text-[10px] md:text-xs" : ""].join(" ")}>
            {powderCaption}
          </figcaption>
        </figure>

        <div className={["hidden w-px shrink-0 bg-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] md:block", ruleH].join(" ")} aria-hidden />

        <motion.div
          style={{ opacity: dividerOpacity }}
          className="relative flex h-px w-[min(72vw,200px)] shrink-0 bg-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] md:hidden"
          aria-hidden
        />

        <figure className="flex w-full max-w-[min(100%,280px)] flex-col items-center md:max-w-[300px]" onMouseEnter={() => onHoverChange("cream")}>
          <span className="sr-only">{creamCaption}</span>
          <DualTextureCreamDisc sizePx={disc} baseColor={creamHex} tone={tone} sheenActive={dualHover === "cream"} className={DISC_TRANSITION} />
          <figcaption className={[capMt, "text-center", captionSans, creamSoft ? softenHeroType : fullHeroType, compact ? "text-[10px] md:text-xs" : ""].join(" ")}>
            {creamCaption}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

export function HeroToneSlider({
  heroTone,
  onToneChange,
  dividerOpacity,
  compact,
}: {
  heroTone: ProductTone;
  onToneChange: (tone: ProductTone) => void;
  dividerOpacity: MotionValue<number>;
  /** Tighter layout for above-the-fold (100vh) landing. */
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [currentTone, setCurrentTone] = useState<ProductTone>(heroTone);
  const [dualHover, setDualHover] = useState<DualHover>("none");

  useEffect(() => {
    setCurrentTone(heroTone);
  }, [heroTone]);

  useEffect(() => {
    trackToneViewed(currentTone);
  }, [currentTone]);

  const tex = TRIO_TONE_TEXTURE[currentTone];

  const goTone = (next: ProductTone) => {
    if (next === currentTone) return;
    setDualHover("none");
    setCurrentTone(next);
    onToneChange(next);
  };

  const idx = TONE_ORDER.indexOf(currentTone);
  const goPrev = () => goTone(TONE_ORDER[(idx - 1 + TONE_ORDER.length) % TONE_ORDER.length]!);
  const goNext = () => goTone(TONE_ORDER[(idx + 1) % TONE_ORDER.length]!);

  const btnClass = compact ? arrowBtnClassCompact : arrowBtnClass;
  const iconSm = compact ? "h-5 w-5 md:h-6 md:w-6" : "h-7 w-7 md:h-9 md:w-9";
  const headlineMb = compact ? "mb-2 md:mb-2.5" : "mb-6 md:mb-8";
  const navMt = compact ? "mt-4 md:mt-5" : "mt-10 md:mt-12";

  return (
    <div className={["relative z-[20] flex w-full max-w-6xl flex-col items-center", compact ? "px-1 md:px-4" : "px-2 md:px-8"].join(" ")}>
      <p
        className={[
          "max-w-[min(100%,28rem)] text-center font-sans text-[11px] font-medium uppercase leading-relaxed tracking-[0.22em] text-[color:color-mix(in_srgb,var(--espresso)_78%,transparent)] transition-all duration-500 ease-in-out md:text-[12px] md:tracking-[0.26em]",
          headlineMb,
        ].join(" ")}
      >
        {t(SLIDE_HEADLINE[currentTone])}
      </p>

      <div className="relative flex w-full max-w-[min(100%,56rem)] items-center justify-center gap-0.5 sm:gap-1 md:gap-3">
        <button type="button" className={btnClass} aria-label={t("home_hero_arrow_prev_aria")} onClick={goPrev}>
          <ChevronLeft className={iconSm} strokeWidth={1.25} aria-hidden />
        </button>

        <div className="relative z-[15] min-w-0 flex-1">
          <ToneSlideContent
            tone={currentTone}
            powderHex={tex.powder}
            creamHex={tex.cream}
            showHeadline={false}
            powderCaption={t("home_texture_powder")}
            creamCaption={t("home_texture_cream")}
            dividerOpacity={dividerOpacity}
            dualHover={dualHover}
            onHoverChange={setDualHover}
            compact={compact}
          />
        </div>

        <button type="button" className={btnClass} aria-label={t("home_hero_arrow_next_aria")} onClick={goNext}>
          <ChevronRight className={iconSm} strokeWidth={1.25} aria-hidden />
        </button>
      </div>

      <nav className={["flex w-full max-w-md flex-col items-center gap-3", navMt].join(" ")} aria-label={t("home_hero_tone_tabs_aria")}>
        <div className="flex cursor-pointer items-center justify-center gap-2.5 md:gap-3" role="tablist">
          {TONE_ORDER.map((tone) => {
            const active = currentTone === tone;
            return (
              <button
                key={tone}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => goTone(tone)}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-full border-0 bg-transparent p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--espresso)]"
              >
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_24%,transparent)] transition-all duration-300 ease-out md:h-3 md:w-3",
                    active ? "scale-110 bg-[color:var(--espresso)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--sand)_90%,transparent)]" : "bg-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--espresso)_28%,transparent)]",
                  ].join(" ")}
                  aria-hidden
                />
                <span
                  className={[
                    "cursor-pointer font-sans text-[9px] font-semibold uppercase tracking-[0.26em] md:text-[10px]",
                    active ? "text-[color:var(--espresso)]" : "text-muted hover:text-[color:var(--espresso)]",
                  ].join(" ")}
                >
                  {t(NAV_LABEL[tone])}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
