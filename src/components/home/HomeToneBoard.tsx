"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { AssetSvg } from "@/components/AssetSvg";
import { SpatialCard } from "@/components/portal/SpatialCard";
import { ToneSwatchFill } from "@/components/home/ToneSwatchFill";
import { useI18n } from "@/i18n/LanguageProvider";
import { productDefs } from "@/lib/products";

function CircleSwatch({
  tone,
  part,
  label,
}: {
  tone: "light" | "bronzer" | "deep";
  part: "cream" | "powder";
  label: string;
}) {
  return (
    <figure className="flex flex-col items-center gap-2.5">
      <ToneSwatchFill
        tone={tone}
        part={part}
        sizePx={88}
        className="shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.5)]"
      />
      <figcaption className="text-[8px] font-semibold uppercase tracking-[0.32em] text-[color:rgba(232,196,92,0.5)]">
        {label}
      </figcaption>
    </figure>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function HomeToneBoard() {
  const { t } = useI18n();
  const items = productDefs;

  return (
    <section
      className="relative overflow-hidden border-t border-[color:rgba(255,255,255,0.05)] bg-[#050403] py-16 md:py-20"
      aria-label={t("home_tones_aria")}
      style={{ perspective: "var(--vision-perspective)" }}
    >
      {/* ambient depth haze */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 110%, rgba(232,196,92,0.1), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.42em] text-[color:rgba(232,196,92,0.65)]">
          {t("home_tones_kicker")}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:rgba(245,240,234,0.92)] md:text-2xl">
          {t("home_tones_title")}
        </h2>
      </div>

      <motion.div
        className="relative z-10 mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 px-5 md:mt-12 md:grid-cols-3 md:gap-7"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        {items.map((p, i) => {
          const hero = p.media.find((m) => m.tag === "Packaging") ?? p.media[p.media.length - 1]!;

          return (
            <motion.div key={p.slug} variants={item}>
              <Link href={`/shop/${p.slug}`} prefetch className="group block h-full">
                <SpatialCard
                  depthZ={i === 1 ? 20 : 0}
                  glowStrength={0.9}
                  className="h-full p-5"
                >
                  {/* header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[8px] font-semibold uppercase tracking-[0.32em] text-[color:rgba(232,196,92,0.6)]">
                        {p.subtitle}
                      </p>
                      <p className="mt-1.5 font-[family-name:var(--font-display)] text-lg tracking-tight text-[color:rgba(245,240,234,0.96)]">
                        {p.name}
                      </p>
                    </div>
                    <span className="ck-neon-tag mt-1 shrink-0">{p.tone}</span>
                  </div>

                  {/* swatches */}
                  <div className="mt-6 flex items-center justify-center gap-8">
                    <CircleSwatch tone={p.tone} part="cream" label={t("home_swatch_cream")} />
                    <CircleSwatch tone={p.tone} part="powder" label={t("home_swatch_powder")} />
                  </div>

                  {/* product image panel — inner spatial depth */}
                  <div
                    className="mt-6 overflow-hidden rounded-[20px] border border-[color:rgba(255,255,255,0.06)]"
                    style={{
                      background: "#0a0806",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 32px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <AssetSvg
                        src={hero.src}
                        alt={hero.alt}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.04]"
                        fit="slice"
                      />
                      {/* holographic sheen on image */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(232,196,92,0.06)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>
                  </div>

                  {/* eye-tracking CTA strip */}
                  <div className="mt-4 flex items-center gap-2 opacity-0 transition-all duration-400 group-hover:opacity-100">
                    <div className="h-[1px] flex-1 bg-[color:rgba(232,196,92,0.28)]" />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[color:rgba(232,196,92,0.82)]">
                      Explore →
                    </span>
                  </div>
                </SpatialCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
