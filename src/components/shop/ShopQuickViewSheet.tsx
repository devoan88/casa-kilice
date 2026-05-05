"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { useI18n } from "@/i18n/LanguageProvider";
import { productDefs } from "@/lib/products";

export function ShopQuickViewSheet({
  slug,
  open,
  onClose,
}: {
  slug: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const def = slug ? productDefs.find((p) => p.slug === slug) : null;

  return (
    <AnimatePresence>
      {open && def ? (
        <>
          <motion.button
            type="button"
            aria-label={t("shop_quick_close")}
            className="fixed inset-0 z-[80] bg-[color:rgba(45,27,27,0.45)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[90] flex h-full w-[min(100%,420px)] flex-col border-l border-border bg-[color:var(--surface-strong)] shadow-[-20px_0_60px_rgba(45,27,27,0.12)]"
            initial={{ x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--espresso)]">
                  {def.name}
                </p>
                <p className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.26em] text-muted">
                  {def.subtitle}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 text-sm text-muted hover:text-foreground"
                onClick={onClose}
              >
                {t("shop_quick_close")}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-sm leading-relaxed text-muted">{def.description}</p>
              <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.32em] text-[color:var(--espresso)]">
                {t("home_ingredients_kicker")}
              </p>
              <p className="mt-3 text-left text-xs leading-relaxed text-muted">{t("home_ingredients_body")}</p>
            </div>
            <div className="border-t border-border p-6">
              <Link
                href={`/shop/${def.slug}`}
                prefetch
                onClick={onClose}
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-background text-xs font-medium uppercase tracking-[0.22em] text-foreground hover:bg-[color:color-mix(in_srgb,var(--surface)_88%,var(--espresso)_12%)]"
              >
                {t("shop_quick_full_page")}
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
