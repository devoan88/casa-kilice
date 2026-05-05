"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { EditorialReveal } from "@/components/quiet/EditorialReveal";
import {
  ShopProductCardBronzer,
  ShopProductCardDeep,
  ShopProductCardLight,
} from "@/components/shop/ShopToneProductCards";
import { ShopQuickViewSheet } from "@/components/shop/ShopQuickViewSheet";
import { useI18n } from "@/i18n/LanguageProvider";
import { productAssetPath } from "@/lib/productMedia";
import type { ShopProductLite } from "@/lib/shopTypes";

export type { ShopProductLite };

const SLUG_ORDER = ["luminous-ivory-duo", "soleil-bronze-duo", "velvet-noir-duo"] as const;

export function ShopPageClient({
  products,
  staticCatalogNotice,
}: {
  products: ShopProductLite[];
  /** Shown when SQLite/Prisma failed but static product data is still displayed. */
  staticCatalogNotice?: boolean;
}) {
  const { t } = useI18n();
  const [qvSlug, setQvSlug] = useState<string | null>(null);
  const packagingSrc = productAssetPath("packaging");

  const sorted = useMemo(() => {
    const rank = (slug: string) => {
      const i = SLUG_ORDER.indexOf(slug as (typeof SLUG_ORDER)[number]);
      return i === -1 ? 99 : i;
    };
    return [...products].sort((a, b) => rank(a.slug) - rank(b.slug));
  }, [products]);

  const lightProduct = sorted.find((p) => p.slug === "luminous-ivory-duo");
  const bronzerProduct = sorted.find((p) => p.slug === "soleil-bronze-duo");
  const deepProduct = sorted.find((p) => p.slug === "velvet-noir-duo");

  const extras = useMemo(
    () => sorted.filter((p) => !(SLUG_ORDER as readonly string[]).includes(p.slug)),
    [sorted],
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-14 md:py-20">
      <ShopQuickViewSheet slug={qvSlug} open={qvSlug != null} onClose={() => setQvSlug(null)} />

      {staticCatalogNotice ? (
        <p
          role="status"
          className="mb-8 rounded-2xl border border-[color:color-mix(in_srgb,var(--hermes)_25%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_90%,transparent)] px-4 py-3 text-sm text-muted"
        >
          {t("shop_static_catalog_notice")}
        </p>
      ) : null}

      <EditorialReveal className="flex max-w-2xl flex-col gap-3">
        <p className="text-sm tracking-[0.28em] uppercase text-muted">{t("shop_kicker")}</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
          {t("shop_title")}
        </h1>
        <p className="max-w-prose text-muted">{t("shop_intro")}</p>
      </EditorialReveal>

      <div className="mx-auto mt-14 grid max-w-[1200px] grid-cols-1 gap-8 px-2 py-4 md:mt-16 md:grid-cols-3 md:gap-6 md:px-4">
        <ShopProductCardLight
          product={lightProduct}
          packagingSrc={packagingSrc}
          onQuickView={setQvSlug}
        />
        <ShopProductCardBronzer
          product={bronzerProduct}
          packagingSrc={packagingSrc}
          onQuickView={setQvSlug}
        />
        <ShopProductCardDeep product={deepProduct} packagingSrc={packagingSrc} onQuickView={setQvSlug} />
      </div>

      {extras.length > 0 ? (
        <section className="mx-auto mt-16 max-w-[1200px] border-t border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] px-2 pt-12 md:px-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">{t("shop_kicker")}</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[color:var(--espresso)]">
            Full catalog
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">Every active product in the database, including items added from the admin console.</p>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {extras.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/shop/${p.slug}`}
                  prefetch
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,#fff_96%,var(--sand))] shadow-sm transition hover:border-[color:color-mix(in_srgb,var(--espresso)_24%,transparent)]"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[color:var(--sand-soft)]">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-muted">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-4 py-4">
                    <p className="font-[family-name:var(--font-display)] text-lg text-[color:var(--espresso)]">{p.name}</p>
                    <p className="text-xs text-muted">{p.subtitle || p.slug}</p>
                    <p className="mt-auto pt-3 text-sm font-medium tabular-nums text-[color:var(--espresso)]">
                      {new Intl.NumberFormat("ka-GE", {
                        style: "currency",
                        currency: p.currency,
                        maximumFractionDigits: 0,
                      }).format(p.priceCents / 100)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
