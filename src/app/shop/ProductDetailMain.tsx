"use client";

import { BuyButton } from "@/components/BuyButton";
import { useI18n } from "@/i18n/LanguageProvider";
import { pdpSubtitleKeyForSlug, shopCardKeyForSlug } from "@/i18n/slugMessages";

export function ProductDetailMain({
  slug,
  productName,
  priceGel,
  imageSrc,
}: {
  slug: string;
  productName: string;
  priceGel: number;
  imageSrc: string;
}) {
  const { t } = useI18n();

  return (
    <div className="rounded-[36px] border border-border bg-surface p-7 shadow-[0_22px_56px_rgba(45,27,27,0.08)] md:p-10">
      <p className="text-sm tracking-[0.28em] uppercase text-muted">{t("product_maison")}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
        {productName}
      </h1>
      <p className="mt-2 text-sm tracking-[0.18em] uppercase text-muted">{t(pdpSubtitleKeyForSlug(slug))}</p>
      <p className="mt-4 text-base leading-7 text-muted">{t(shopCardKeyForSlug(slug))}</p>

      <div className="mt-8 grid gap-4">
        <BuyButton slug={slug} name={productName} priceGel={priceGel} imageSrc={imageSrc} />
        <div className="rounded-[30px] border border-border bg-background p-5 text-sm leading-relaxed text-muted">
          <p>{t("product_note")}</p>
        </div>
      </div>
    </div>
  );
}
