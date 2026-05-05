"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { useI18n } from "@/i18n/LanguageProvider";

export function HeroTextSlider({
  editorial = false,
  onSlideChange,
}: {
  editorial?: boolean;
  onSlideChange?: (index: number) => void;
}) {
  const { t, locale } = useI18n();
  const [i, setI] = useState(0);

  const slides = useMemo(
    () => [
      { title: t("hero_s0_title"), latin: t("hero_s0_latin") },
      { title: t("hero_s1_title"), latin: t("hero_s1_latin") },
      { title: t("hero_s2_title"), latin: t("hero_s2_latin") },
    ],
    [t, locale],
  );

  useEffect(() => {
    setI(0);
  }, [locale]);

  useEffect(() => {
    const id = window.setInterval(
      () => setI((v) => (v + 1) % slides.length),
      3400,
    );
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    onSlideChange?.(i);
  }, [i, onSlideChange]);

  const slide = slides[i]!;

  if (editorial) {
    return (
      <div className="relative w-full border-l border-[color:color-mix(in_srgb,var(--gold)_40%,transparent)] pl-6 md:pl-8">
        <div className="relative min-h-[10.5rem] w-full overflow-hidden md:min-h-[12rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${locale}-${slide.title}-ed`}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-start justify-center pr-2 text-left"
            >
              <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] tracking-tight">
                {slide.title}
              </h1>
              <p className="ck-latin-motto mt-5 max-w-md text-left">{slide.latin}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-5xl items-stretch justify-center gap-6 md:gap-12">
      <aside
        className="hidden w-[2.25rem] shrink-0 md:flex md:items-center md:justify-center"
        aria-label="Heritage"
      >
        <p className="font-[family-name:var(--font-display)] text-[10px] font-medium uppercase leading-loose tracking-[0.42em] text-[color:rgba(243,229,171,0.88)] [text-orientation:mixed] [writing-mode:vertical-rl] rotate-180">
          {t("hero_rail")}
        </p>
      </aside>

      <div className="relative min-h-[9rem] flex-1 overflow-hidden md:min-h-[10.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${locale}-${slide.title}`}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center"
          >
            <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight md:text-5xl">
              {slide.title}
            </h1>
            <p className="ck-latin-motto mt-4 max-w-md">{slide.latin}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="hidden w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-[color:rgba(243,229,171,0.45)] to-transparent md:block"
        aria-hidden
      />
    </div>
  );
}
