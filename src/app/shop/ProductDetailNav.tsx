"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/LanguageProvider";

export function ProductDetailNav({ priceLabel }: { priceLabel: string }) {
  const { t } = useI18n();

  return (
    <div className="mb-8 flex items-center justify-between">
      <Link
        href="/shop"
        className="text-sm tracking-[0.18em] uppercase text-muted hover:text-[color:var(--accent-strong)]"
      >
        {t("product_back")}
      </Link>
      <div className="text-right">
        <p className="text-sm tracking-[0.18em] uppercase text-muted">{t("product_price_label")}</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-medium tabular-nums text-[color:var(--espresso)] md:text-xl">
          {priceLabel}
        </p>
      </div>
    </div>
  );
}
