"use client";

import Link from "next/link";

import { CatalogToneDuoVisual } from "@/components/catalog/CatalogToneDuoVisual";
import { AssetSvg } from "@/components/AssetSvg";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/LanguageProvider";
import { EditorialReveal } from "@/components/quiet/EditorialReveal";
import { shopCardKeyForSlug } from "@/i18n/slugMessages";
import { formatMoney } from "@/lib/money";
import { productAssetPath } from "@/lib/productMedia";
import type { ProductTone } from "@/lib/products";
import { TRIO_TONE_TEXTURE } from "@/lib/trioTonePalettes";

/** Mirrors `ShopPageClient` product row from Prisma + catalog merge. */
export type ShopGridProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  tone: ProductTone;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
};

type ToneCardDef = {
  tone: ProductTone;
  slug: string;
  taglineKey: MessageKey;
  blurbKey: MessageKey;
};

function ShopToneProductCardShell({
  def,
  product,
  money,
  packagingSrc,
  revealDelay,
  onQuickView,
}: {
  def: ToneCardDef;
  product: ShopGridProduct;
  money: string;
  packagingSrc: string;
  revealDelay: number;
  onQuickView: (slug: string) => void;
}) {
  const { t } = useI18n();
  const hx = TRIO_TONE_TEXTURE[def.tone];

  return (
    <EditorialReveal delay={revealDelay} className="relative [perspective:1400px]">
      <div className="ck-float-3d group relative overflow-hidden rounded-[36px] border border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] bg-[color:var(--surface-strong)] shadow-[0_12px_40px_rgba(45,27,27,0.07)] transition-shadow duration-[700ms] ease-out hover:shadow-[0_36px_88px_rgba(25,12,12,0.22)]">
        <div className="relative z-[3] space-y-2 border-b border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_92%,var(--sand)_8%)] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-[family-name:var(--font-display)] text-sm font-medium tracking-tight text-[color:var(--espresso)] md:text-base">
                {product.name}
              </p>
              <p className="mt-0.5 truncate font-sans text-[9px] font-medium uppercase tracking-[0.24em] text-muted md:text-[10px]">
                {t(def.taglineKey)}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-[color:var(--espresso)] md:text-sm">{money}</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span
              className="h-3 w-3 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] shadow-[inset_0_1px_0_rgba(255,252,248,0.35)]"
              style={{ backgroundColor: hx.powder }}
              title="Powder"
            />
            <span
              className="h-3 w-3 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] shadow-[inset_0_-1px_0_rgba(0,0,0,0.18)]"
              style={{ backgroundColor: hx.cream }}
              title="Cream"
            />
            <button
              type="button"
              className="rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--sand-soft)_55%,#fff)] px-2.5 py-1 font-sans text-[8px] font-medium uppercase tracking-[0.2em] text-[color:var(--espresso)] hover:bg-background"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product.slug);
              }}
            >
              {t("shop_quick_view")}
            </button>
          </div>
        </div>

        <Link href={`/shop/${product.slug}`} className="relative block" aria-label={`${product.name}, ${money}`}>
          <span className="sr-only">
            {product.name}. {money}. {t(shopCardKeyForSlug(product.slug))}
          </span>
          <div className="relative flex aspect-[4/3] w-full overflow-hidden bg-background">
            <div className="relative w-[56%] min-w-0 shrink-0">
              <CatalogToneDuoVisual
                tone={def.tone}
                variant="card"
                labelVisibility="hover"
                className="h-full min-h-full w-full transition-transform duration-[750ms] ease-out group-hover:scale-[1.01]"
              />
            </div>
            <div className="relative min-h-0 flex-1 border-l border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)]">
              <AssetSvg
                src={packagingSrc}
                alt=""
                className="absolute inset-0 h-full w-full transition-transform duration-[750ms] ease-out group-hover:scale-[1.03]"
                fit="slice"
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:color-mix(in_srgb,var(--espresso)_88%,transparent)] via-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] to-transparent opacity-0 transition-opacity duration-[650ms] ease-out group-hover:opacity-100"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] space-y-2 p-5 text-[color:var(--sand-soft)] opacity-0 transition-all duration-[650ms] ease-out translate-y-3 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-xs font-medium tracking-tight text-[color:var(--sand-soft)]">{product.name}</p>
              <p className="line-clamp-3 text-[11px] leading-relaxed text-[color:color-mix(in_srgb,var(--sand-soft)_74%,transparent)]">
                {t(def.blurbKey)}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[color:color-mix(in_srgb,var(--sand-soft)_85%,var(--sand-deeper)_15%)]">
                {money}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </EditorialReveal>
  );
}

const LIGHT_DEF: ToneCardDef = {
  tone: "light",
  slug: "luminous-ivory-duo",
  taglineKey: "shop_light_tone_tagline",
  blurbKey: "shop_light_tone_card_blurb",
};

const BRONZER_DEF: ToneCardDef = {
  tone: "bronzer",
  slug: "soleil-bronze-duo",
  taglineKey: "shop_bronzer_tone_tagline",
  blurbKey: "shop_bronzer_card_blurb",
};

const DEEP_DEF: ToneCardDef = {
  tone: "deep",
  slug: "velvet-noir-duo",
  taglineKey: "shop_deep_tone_tagline",
  blurbKey: "shop_deep_card_blurb",
};

export function ShopProductCardLight({
  product,
  packagingSrc,
  onQuickView,
}: {
  product: ShopGridProduct | undefined;
  packagingSrc: string;
  onQuickView: (slug: string) => void;
}) {
  if (!product || product.slug !== LIGHT_DEF.slug) return null;
  const money = formatMoney(product.priceCents, product.currency);
  return (
    <ShopToneProductCardShell
      def={LIGHT_DEF}
      product={product}
      money={money}
      packagingSrc={packagingSrc}
      revealDelay={0}
      onQuickView={onQuickView}
    />
  );
}

export function ShopProductCardBronzer({
  product,
  packagingSrc,
  onQuickView,
}: {
  product: ShopGridProduct | undefined;
  packagingSrc: string;
  onQuickView: (slug: string) => void;
}) {
  if (!product || product.slug !== BRONZER_DEF.slug) return null;
  const money = formatMoney(product.priceCents, product.currency);
  return (
    <ShopToneProductCardShell
      def={BRONZER_DEF}
      product={product}
      money={money}
      packagingSrc={packagingSrc}
      revealDelay={0.06}
      onQuickView={onQuickView}
    />
  );
}

export function ShopProductCardDeep({
  product,
  packagingSrc,
  onQuickView,
}: {
  product: ShopGridProduct | undefined;
  packagingSrc: string;
  onQuickView: (slug: string) => void;
}) {
  if (!product || product.slug !== DEEP_DEF.slug) return null;
  const money = formatMoney(product.priceCents, product.currency);
  return (
    <ShopToneProductCardShell
      def={DEEP_DEF}
      product={product}
      money={money}
      packagingSrc={packagingSrc}
      revealDelay={0.12}
      onQuickView={onQuickView}
    />
  );
}
