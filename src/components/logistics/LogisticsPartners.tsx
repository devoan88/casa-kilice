"use client";

import { useI18n } from "@/i18n/LanguageProvider";

const ALL = [
  { key: "dhl" as const, label: "DHL" },
  { key: "fedex" as const, label: "FedEx" },
  { key: "aramex" as const, label: "Aramex" },
];

const EXPRESS = [
  { key: "dhl" as const, label: "DHL" },
  { key: "fedex" as const, label: "FedEx" },
];

export function LogisticsPartners({
  className = "",
  dense = false,
  onDark = false,
  variant = "default",
  brands = "all",
}: {
  className?: string;
  dense?: boolean;
  onDark?: boolean;
  /** Wordmarks only, neutral / monochrome treatment */
  variant?: "default" | "monochrome";
  brands?: "all" | "express";
}) {
  const { t } = useI18n();

  const marks = brands === "express" ? EXPRESS : ALL;

  if (variant === "monochrome") {
    return (
      <div
        className={`flex flex-wrap items-center gap-x-10 gap-y-3 ${className}`}
        role="group"
        aria-label={t("logistics_partners_aria")}
      >
        {marks.map((m) => (
          <span
            key={m.key}
            className={[
              "select-none font-[system-ui,sans-serif] text-[11px] font-semibold uppercase tracking-[0.42em]",
              onDark ? "text-[color:color-mix(in_srgb,var(--gold)_82%,white_18%)]" : "text-muted",
            ].join(" ")}
          >
            {m.label}
          </span>
        ))}
      </div>
    );
  }

  const chip = onDark
    ? "border-[color:color-mix(in_srgb,var(--gold)_36%,transparent)] bg-[color:color-mix(in_srgb,var(--mahogany)_08%,var(--surface-strong)_92%)] text-foreground"
    : "border-[color:color-mix(in_srgb,var(--gold)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_92%,var(--background)_8%)] text-muted";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="group"
      aria-label={t("logistics_partners_aria")}
    >
      {marks.map((m) => (
        <span
          key={m.key}
          className={`inline-flex items-center justify-center rounded-2xl border font-[system-ui,sans-serif] font-semibold tracking-[0.2em] uppercase ${chip} ${
            dense ? "px-2 py-1 text-[9px]" : "px-3 py-1.5 text-[10px]"
          }`}
        >
          {m.label}
        </span>
      ))}
    </div>
  );
}
