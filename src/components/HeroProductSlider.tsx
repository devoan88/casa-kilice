"use client";

import { useEffect, useMemo, useState } from "react";

import { AssetSvg } from "@/components/AssetSvg";
import { productAssetPath } from "@/lib/productMedia";

type Slide = {
  src: string;
  title: string;
  subtitle: string;
};

export function HeroProductSlider() {
  const slides = useMemo<Slide[]>(
    () => [
      {
        src: productAssetPath("light-cream"),
        title: "LIGHT TONE",
        subtitle: "Setting + Glow Effect",
      },
      {
        src: productAssetPath("bronzer-cream"),
        title: "BRONZER TONE",
        subtitle: "Sunkissed + Glow",
      },
      {
        src: productAssetPath("deep-cream"),
        title: "DEEP TONE",
        subtitle: "Rich Sculpt + Glow",
      },
    ],
    [],
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const s = slides[active]!;

  return (
    <div className="w-full max-w-[420px]">
      <div className="relative overflow-hidden rounded-[36px] border border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_88%,var(--background)_12%)] shadow-[0_26px_60px_rgba(60,53,48,0.1)] backdrop-blur">
        <div className="ck-gloss-hover relative aspect-[4/5] w-full">
          <AssetSvg
            key={`hero-slide-${active}`}
            src={s.src}
            alt={s.title}
            className="absolute inset-0 h-full w-full"
            fit="slice"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(60,53,48,0.42),transparent_55%)]" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <div
            key={`${active}-caption`}
            className="animate-[fadeInUp_520ms_ease-out] text-[color:var(--sand-soft)]"
          >
            <p className="text-xs tracking-[0.34em] uppercase opacity-90">
              {s.subtitle}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">
              {s.title}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
              i === active
                ? "bg-[color:var(--hermes)]"
                : "bg-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)]"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
