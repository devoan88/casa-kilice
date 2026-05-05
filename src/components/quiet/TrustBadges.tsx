"use client";

import { FlaskConical, Leaf, Recycle } from "lucide-react";

import { useI18n } from "@/i18n/LanguageProvider";

const iconKeys = ["trust_derma", "trust_vegan", "trust_recycle"] as const;
const Icons = [FlaskConical, Leaf, Recycle] as const;

export function TrustBadges({
  dense = false,
  tone = "light",
}: {
  dense?: boolean;
  tone?: "light" | "dark";
}) {
  const { t } = useI18n();

  const shell =
    tone === "dark"
      ? "border-[color:color-mix(in_srgb,var(--gold)_34%,transparent)] bg-[color:color-mix(in_srgb,var(--mahogany)_08%,var(--surface-strong)_92%)]"
      : "border-[color:color-mix(in_srgb,var(--gold)_32%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_90%,var(--background)_10%)]";

  return (
    <ul
      className={[
        "flex flex-wrap items-stretch justify-center gap-6 px-5 py-4 backdrop-blur-sm md:gap-10 md:px-8",
        shell,
        dense ? "rounded-[28px] py-3" : "rounded-[32px]",
      ].join(" ")}
    >
      {iconKeys.map((key, idx) => {
        const Icon = Icons[idx]!;
        return (
          <li
            key={key}
            className="flex max-w-[11rem] flex-col items-center gap-2 text-center md:max-w-none"
          >
            <Icon
              className="text-[color:var(--gold)]"
              size={dense ? 22 : 26}
              strokeWidth={1}
              aria-hidden
            />
            <span
              className={[
                "text-[9px] font-medium uppercase leading-snug tracking-[0.22em] md:text-[10px] md:tracking-[0.26em]",
                tone === "dark" ? "text-[color:color-mix(in_srgb,var(--foreground)_78%,var(--muted)_22%)]" : "text-muted",
              ].join(" ")}
            >
              {t(key)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
