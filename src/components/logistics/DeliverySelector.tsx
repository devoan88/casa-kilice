"use client";

import { formatMoney } from "@/lib/money";
import { shippingCentsForZone } from "@/lib/shipping";
import { useCommerceRates } from "@/components/commerce/CommerceProvider";
import { useDeliveryZone } from "@/components/logistics/DeliveryZoneProvider";
import { useI18n } from "@/i18n/LanguageProvider";

const CURRENCY = "GEL";

export function DeliverySelector({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const { zone, setZone } = useDeliveryZone();
  const { rates } = useCommerceRates();
  const intlCents = shippingCentsForZone("intl", rates);
  const tbilisiCents = shippingCentsForZone("ge_tbilisi", rates);
  const regionCents = shippingCentsForZone("ge_region", rates);

  return (
    <div className={className}>
      <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-muted">
        {t("cart_delivery_title")}
      </p>
      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => setZone("intl")}
          className={`rounded-2xl border px-4 py-3 text-left transition-all duration-500 ${
            zone === "intl"
              ? "border-[color:color-mix(in_srgb,var(--hermes)_38%,var(--gold)_62%)] bg-[color:color-mix(in_srgb,var(--parchment)_90%,var(--hermes)_10%)]"
              : "border-border bg-background transition-colors duration-500 hover:border-[color:rgba(243,229,171,0.35)]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] uppercase">
                {t("cart_delivery_intl_title")}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {t("cart_delivery_intl_body")}
              </p>
            </div>
            <span className="shrink-0 text-xs tracking-[0.12em] text-foreground">
              {formatMoney(intlCents, CURRENCY)}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setZone("ge_tbilisi")}
          className={`rounded-2xl border px-4 py-3 text-left transition-all duration-500 ${
            zone === "ge_tbilisi"
              ? "border-[color:color-mix(in_srgb,var(--hermes)_38%,var(--gold)_62%)] bg-[color:color-mix(in_srgb,var(--parchment)_90%,var(--hermes)_10%)]"
              : "border-border bg-background transition-colors duration-500 hover:border-[color:rgba(243,229,171,0.35)]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] uppercase">
                {t("cart_delivery_tbilisi_title")}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {t("cart_delivery_tbilisi_body")}
              </p>
            </div>
            <span className="shrink-0 text-xs tracking-[0.12em] text-foreground">
              {formatMoney(tbilisiCents, CURRENCY)}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setZone("ge_region")}
          className={`rounded-2xl border px-4 py-3 text-left transition-all duration-500 ${
            zone === "ge_region"
              ? "border-[color:color-mix(in_srgb,var(--hermes)_38%,var(--gold)_62%)] bg-[color:color-mix(in_srgb,var(--parchment)_90%,var(--hermes)_10%)]"
              : "border-border bg-background transition-colors duration-500 hover:border-[color:rgba(243,229,171,0.35)]"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] uppercase">
                {t("cart_delivery_region_title")}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {t("cart_delivery_region_body")}
              </p>
            </div>
            <span className="shrink-0 text-xs tracking-[0.12em] text-foreground">
              {formatMoney(regionCents, CURRENCY)}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
