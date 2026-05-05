"use client";

import { useMemo, useRef, useState } from "react";

import { CatalogToneDuoVisual } from "@/components/catalog/CatalogToneDuoVisual";
import { AssetSvg } from "@/components/AssetSvg";
import { productAssetPath } from "@/lib/productMedia";
import type { ProductMedia, ProductTone } from "@/lib/products";
import { productDefs } from "@/lib/products";
import { TRIO_TONE_TEXTURE } from "@/lib/trioTonePalettes";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toneForGalleryKey(galleryKey: string): ProductTone | undefined {
  return productDefs.find((p) => p.slug === galleryKey)?.tone;
}

export function ProductGallery({
  media,
  galleryKey = "gallery",
}: {
  media: ProductMedia[];
  galleryKey?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const slides = useMemo(() => {
    const list = media.filter(Boolean);
    if (list.length > 0) return list;
    return [{ src: productAssetPath("packaging"), alt: "Product" }] satisfies ProductMedia[];
  }, [media]);
  const [active, setActive] = useState(0);
  const catalogTone = toneForGalleryKey(galleryKey);
  const showToneSwatches =
    catalogTone != null && slides.some((s) => s.duoRenderTone != null);
  const duoHex = catalogTone ? TRIO_TONE_TEXTURE[catalogTone] : null;

  const go = (index: number) => {
    const next = clamp(index, 0, slides.length - 1);
    setActive(next);
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.children.item(next) as HTMLElement | null;
    child?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-[36px] border border-border bg-surface shadow-[0_26px_60px_rgba(45,27,27,0.09)]">
        <div
          ref={scrollerRef}
          className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            const w = el.clientWidth || 1;
            const idx = Math.round(el.scrollLeft / w);
            setActive(clamp(idx, 0, slides.length - 1));
          }}
        >
          {slides.map((m, i) => (
            <div
              key={`${galleryKey}-slide-${i}`}
              className={[
                "relative w-full shrink-0 snap-start bg-background",
                m.duoRenderTone ? "group" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="ck-gloss-hover relative aspect-[4/3] w-full">
                {m.duoRenderTone ? (
                  <CatalogToneDuoVisual
                    tone={m.duoRenderTone}
                    variant="gallery"
                    labelVisibility="hover"
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <AssetSvg
                    src={m.src}
                    alt={m.alt}
                    className="absolute inset-0 h-full w-full"
                    fit="slice"
                  />
                )}
              </div>
              {m.tag ? (
                <div className="absolute left-5 top-5 rounded-full border border-border bg-[color-mix(in_srgb,var(--surface)_75%,var(--background)_25%)] px-3 py-1 text-xs tracking-[0.18em] uppercase text-foreground">
                  {m.tag}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(active - 1)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-surface px-4 text-xs tracking-[0.18em] uppercase text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_70%,var(--accent)_30%)]"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-surface px-4 text-xs tracking-[0.18em] uppercase text-foreground hover:bg-[color-mix(in_srgb,var(--surface)_70%,var(--accent)_30%)]"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-2">
          {slides.map((m, i) => {
            const isDuoSlide = m.duoRenderTone != null;
            const slideTone = m.duoRenderTone;
            const hx = slideTone ? TRIO_TONE_TEXTURE[slideTone] : null;
            return (
              <button
                key={`${galleryKey}-dot-${i}`}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={[
                  "border border-border transition-[opacity,box-shadow]",
                  isDuoSlide
                    ? "flex h-2.5 w-7 overflow-hidden rounded-full bg-transparent p-0"
                    : "h-2.5 w-2.5 rounded-full",
                  i === active && !isDuoSlide ? "bg-foreground" : "",
                  i === active && isDuoSlide ? "ring-1 ring-foreground ring-offset-2 ring-offset-background" : "",
                  i !== active && !isDuoSlide ? "bg-surface" : "",
                  i !== active && isDuoSlide ? "opacity-80 hover:opacity-100" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {isDuoSlide && hx ? (
                  <>
                    <span
                      className="h-full flex-1 rounded-l-full"
                      style={{ backgroundColor: hx.powder }}
                      aria-hidden
                    />
                    <span
                      className="h-full flex-1 rounded-r-full"
                      style={{ backgroundColor: hx.cream }}
                      aria-hidden
                    />
                  </>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {showToneSwatches && duoHex ? (
        <div className="flex items-center justify-end gap-2 px-0.5" aria-label="Texture tones">
          <span
            className="h-3 w-3 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] shadow-[inset_0_1px_0_rgba(255,252,248,0.35)]"
            style={{ backgroundColor: duoHex.powder }}
            title="Powder"
          />
          <span
            className="h-3 w-3 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)]"
            style={{ backgroundColor: duoHex.cream }}
            title="Cream"
          />
        </div>
      ) : null}
    </div>
  );
}
