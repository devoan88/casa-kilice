"use client";

import { Headset } from "lucide-react";
import { useState } from "react";

import { ConciergeModal } from "@/components/future/ConciergeModal";
import { useI18n } from "@/i18n/LanguageProvider";

export function BeautyConcierge() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-[80] flex h-11 w-11 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--sand-soft)_92%,transparent)] text-[color:var(--espresso)] shadow-[0_14px_40px_rgba(60,53,48,0.1)] backdrop-blur-[10px] transition-colors hover:border-[color:var(--hermes)]"
        aria-label={t("home_concierge")}
      >
        <Headset size={18} strokeWidth={1.35} />
      </button>

      <ConciergeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

