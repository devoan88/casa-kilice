"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useI18n } from "@/i18n/LanguageProvider";

const panelEase = [0.32, 0.72, 0, 1] as const;

export function HomeInfoPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label={t("home_panel_close")}
            className="fixed inset-0 z-[90] bg-[color:color-mix(in_srgb,var(--espresso)_28%,transparent)] backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-info-panel-title"
            initial={{ x: "104%" }}
            animate={{ x: 0 }}
            exit={{ x: "104%" }}
            transition={{ duration: 0.58, ease: panelEase }}
            className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-md flex-col border-l border-[color:color-mix(in_srgb,var(--espresso)_10%,transparent)] bg-[color:var(--sand-raised)] shadow-[-24px_0_64px_rgba(60,53,48,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] px-6 py-5">
              <h2
                id="home-info-panel-title"
                className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[color:var(--espresso)]"
              >
                {t("home_panel_title")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[color:var(--espresso)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--sand-soft)_80%,transparent)]"
                aria-label={t("home_panel_close")}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-8">
              <section className="space-y-3 border-b border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] pb-8">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted">
                  {t("home_panel_section_orientation")}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--espresso)]">
                  {t("home_panel_orientation")}
                </p>
              </section>
              <section className="mt-10 space-y-3">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted">
                  {t("home_panel_section_story")}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--espresso)]">
                  {t("home_panel_story")}
                </p>
              </section>
              <section className="mt-10 space-y-3">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted">
                  {t("home_panel_section_howto")}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--espresso)]">
                  {t("home_panel_howto")}
                </p>
              </section>
              <section className="mt-10 space-y-3">
                <h3 className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted">
                  {t("home_panel_section_details")}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--espresso)]">
                  {t("home_panel_details")}
                </p>
              </section>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
