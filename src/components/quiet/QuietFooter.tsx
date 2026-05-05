"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { LogisticsPartners } from "@/components/logistics/LogisticsPartners";
import { EditorialReveal } from "@/components/quiet/EditorialReveal";
import { useI18n } from "@/i18n/LanguageProvider";

export function QuietFooter({
  showAdminFooterLink = false,
  children,
}: {
  showAdminFooterLink?: boolean;
  /** Server slot: secondary nav links (must be rendered by a Server Component parent). */
  children?: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <footer className="relative z-10 mt-28 bg-transparent">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12">
        <div className="h-px w-full bg-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)]" />

        <EditorialReveal className="mt-12">
          <LogisticsPartners variant="monochrome" brands="express" />
        </EditorialReveal>

        <p className="mt-8 max-w-xl text-xs leading-relaxed text-muted">{t("logistics_care_note")}</p>

        <div className="my-14 h-px w-full bg-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)]" />

        <EditorialReveal delay={0.05}>
          <p className="font-[family-name:var(--font-display)] text-lg tracking-tight text-foreground md:text-xl">
            {t("footer_inner")}
          </p>
          <p className="mt-3 max-w-md text-sm text-muted">{t("footer_inner_body")}</p>
          <Link
            href="/membership"
            prefetch
            className="mt-5 inline-flex text-[11px] tracking-[0.24em] uppercase text-foreground transition-colors duration-700 hover:text-[color:var(--hermes)]"
          >
            {t("footer_explore")}
          </Link>

          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="email"
              placeholder={t("footer_email_ph")}
              className="h-11 w-full border-0 border-b border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-transparent px-0 text-sm text-foreground outline-none placeholder:text-muted/60 focus:border-[color:color-mix(in_srgb,var(--espresso)_35%,transparent)]"
            />
            <button
              type="button"
              className="ck-metallic inline-flex h-11 shrink-0 items-center justify-center rounded-full px-8 text-[10px] font-medium uppercase sm:ml-2"
            >
              {t("footer_join")}
            </button>
          </div>
        </EditorialReveal>

        <div className="mt-16 h-px w-full bg-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)]" />

        {children}

        <div className="mt-8 flex flex-col gap-2 text-[10px] tracking-[0.22em] text-muted md:flex-row md:items-center md:justify-between">
          <span>{t("footer_copy", { year: new Date().getFullYear() })}</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {showAdminFooterLink ? (
              <Link
                href="/casa-admin"
                prefetch={false}
                className="text-[7px] font-medium uppercase tracking-[0.42em] text-[color:color-mix(in_srgb,var(--espresso)_32%,transparent)] transition-opacity hover:text-[color:var(--espresso)]"
              >
                Admin
              </Link>
            ) : null}
            <span>{t("footer_ship")}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
