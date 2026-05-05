"use client";

import { LOCALE_LABEL, LOCALES } from "@/i18n/types";
import { useI18n } from "@/i18n/LanguageProvider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={[
        "flex items-center rounded-full border border-[color:rgba(243,229,171,0.32)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] px-1 py-0.5 backdrop-blur-sm transition-colors duration-500",
        compact ? "scale-90" : "",
      ].join(" ")}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code, idx) => {
        const active = locale === code;
        return (
          <span key={code} className="flex items-center">
            {idx > 0 ? (
              <span className="px-0.5 text-[10px] text-muted/40" aria-hidden>
                |
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setLocale(code)}
              className={[
                "rounded-full px-2 py-1 text-[9px] font-medium uppercase tracking-[0.22em] transition-colors md:px-2.5 md:text-[10px]",
                active
                  ? "bg-[color:color-mix(in_srgb,var(--hermes)_22%,transparent)] text-[color:var(--espresso)]"
                  : "text-muted transition-colors duration-500 hover:text-[color:var(--hermes)]",
              ].join(" ")}
              aria-pressed={active}
              aria-label={`${LOCALE_LABEL[code]} language`}
            >
              {LOCALE_LABEL[code]}
            </button>
          </span>
        );
      })}
    </div>
  );
}
