"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { LogisticsPartners } from "@/components/logistics/LogisticsPartners";
import { AssetSvg } from "@/components/AssetSvg";
import { useCart } from "@/components/cart/CartProvider";
import { useI18n } from "@/i18n/LanguageProvider";
import { formatMoney } from "@/lib/money";
import type { MessageKey } from "@/i18n/messages";

function cartTaglineKeyForSlug(slug: string): MessageKey | null {
  if (slug === "luminous-ivory-duo") return "shop_light_tone_tagline";
  if (slug === "soleil-bronze-duo") return "shop_bronzer_tone_tagline";
  if (slug === "velvet-noir-duo") return "shop_deep_tone_tagline";
  return null;
}

const CART_CURRENCY = "GEL";

function gelMajorToDisplay(majorUnits: number) {
  return formatMoney(Math.round(majorUnits * 100), CART_CURRENCY);
}

export function CartDrawer() {
  const cart = useCart();
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {cart.open ? (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-[color:rgba(45,27,27,0.42)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => cart.closeCart()}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] h-full w-[360px] max-w-[92vw] border-l border-border bg-[color:var(--surface-strong)] p-5 shadow-[-16px_0_48px_rgba(45,27,27,0.1)]"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="flex items-center justify-between">
              <p className="font-[family-name:var(--font-display)] text-lg tracking-tight">{t("cart_title")}</p>
              <button className="text-sm text-muted hover:text-foreground" onClick={() => cart.closeCart()}>
                {t("cart_close")}
              </button>
            </div>

            <div className="mt-5 flex h-[calc(100%-140px)] flex-col gap-4 overflow-auto pr-1">
              {cart.items.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background p-5 text-sm text-muted">{t("cart_empty")}</div>
              ) : (
                cart.items.map((it) => (
                  <div key={it.id} className="flex gap-3 rounded-2xl border border-border bg-background p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border">
                      <AssetSvg src={it.imageSrc} alt={it.name} className="h-full w-full" fit="slice" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{it.name}</p>
                      {(() => {
                        const tagKey = cartTaglineKeyForSlug(it.id);
                        return tagKey ? (
                          <p className="mt-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
                            {t(tagKey)}
                          </p>
                        ) : null;
                      })()}
                      <p className="mt-1 text-xs text-muted">{gelMajorToDisplay(it.price)}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <button className="h-8 w-8 rounded-full border border-border" onClick={() => cart.setQty(it.id, it.qty - 1)}>
                          −
                        </button>
                        <span className="w-6 text-center text-sm">{it.qty}</span>
                        <button className="h-8 w-8 rounded-full border border-border" onClick={() => cart.setQty(it.id, it.qty + 1)}>
                          +
                        </button>
                        <button className="ml-auto text-xs text-muted hover:text-foreground" onClick={() => cart.removeItem(it.id)}>
                          {t("cart_remove")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t("cart_subtotal")}</span>
                  <span>{gelMajorToDisplay(cart.total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => cart.closeCart()}
                className={`ck-metallic mt-4 inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm tracking-[0.18em] uppercase ${
                  cart.items.length === 0 ? "pointer-events-none opacity-45" : ""
                }`}
                aria-disabled={cart.items.length === 0}
              >
                {t("cart_checkout")}
              </Link>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">{t("logistics_care_note")}</p>
              <div className="mt-4 flex justify-center">
                <LogisticsPartners dense />
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
