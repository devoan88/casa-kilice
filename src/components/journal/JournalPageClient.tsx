"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { JournalCardImage } from "@/components/journal/JournalCardImage";
import type { JournalArticleDTO } from "@/lib/journal/types";
import { useI18n } from "@/i18n/LanguageProvider";

function formatPub(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : locale === "de" ? "de-DE" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

type FetchState =
  | { status: "loading" }
  | { status: "ready"; articles: JournalArticleDTO[] }
  | { status: "updating" };

export function JournalPageClient() {
  const { t, locale } = useI18n();
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/journal", { method: "GET", cache: "no-store" });
        const body = (await res.json()) as {
          ok: boolean;
          articles?: JournalArticleDTO[];
        };
        if (cancelled) return;
        if (body.ok && Array.isArray(body.articles) && body.articles.length > 0) {
          setState({ status: "ready", articles: body.articles });
          return;
        }
        setState({ status: "updating" });
      } catch {
        if (!cancelled) setState({ status: "updating" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-[60vh] bg-[color:var(--sand)] pb-24 pt-8 md:pt-12">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] pb-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            prefetch
            className="inline-flex w-fit items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_92%,transparent)] px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--espresso)] shadow-[0_8px_28px_rgba(60,53,48,0.08)] transition-colors duration-500 hover:border-[color:var(--hermes)] hover:text-[color:var(--hermes)]"
          >
            {t("journal_back_home")}
          </Link>
        </div>

        <header className="border-b border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] pb-10 md:pb-12">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-muted">{t("journal_kicker")}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[0.02em] text-[color:var(--espresso)] md:text-4xl lg:text-[2.75rem]">
            {t("journal_title")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">{t("journal_intro")}</p>
        </header>

        {state.status === "loading" ? (
          <p className="mt-16 text-center text-sm text-muted">{t("journal_loading")}</p>
        ) : null}

        {state.status === "updating" ? (
          <p className="mt-16 text-center text-sm leading-relaxed text-muted md:text-base">{t("journal_updating")}</p>
        ) : null}

        {state.status === "ready" ? (
          <ul className="mt-12 grid list-none grid-cols-1 gap-8 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
            {state.articles.map((a) => (
              <li key={a.id} className="group">
                <article className="flex h-full flex-col overflow-hidden rounded-[clamp(0.95rem,1.8vw,1.25rem)] border border-[color:color-mix(in_srgb,var(--espresso)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_92%,#fff)] shadow-[0_18px_48px_rgba(60,53,48,0.08)]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[color:color-mix(in_srgb,var(--sand-soft)_55%,#fff)]">
                    {a.isDailyEdit ? (
                      <span className="absolute left-3 top-3 z-10 rounded-full border border-[color:color-mix(in_srgb,var(--espresso)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_95%,transparent)] px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.26em] text-[color:var(--espresso)] backdrop-blur-[6px]">
                        {t("journal_daily_edit")}
                      </span>
                    ) : null}
                    <JournalCardImage imageUrl={a.imageUrl} alt={a.title} />
                  </div>

                  <div className="flex flex-1 flex-col px-4 pb-5 pt-4 md:px-5 md:pb-6 md:pt-5">
                    <time className="text-[9px] font-medium uppercase tracking-[0.24em] text-muted">
                      {formatPub(a.pubDate, locale)}
                    </time>
                    <h2 className="mt-1.5 line-clamp-3 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug tracking-tight text-[color:var(--espresso)] md:text-xl">
                      {a.title}
                    </h2>
                    <p className="mt-2 line-clamp-6 flex-1 text-xs leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_78%,#444)] md:text-[13px] md:leading-[1.65]">
                      {a.snippet}
                    </p>

                    <p className="mt-3">
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--espresso)] underline-offset-4 transition-colors hover:text-[color:var(--hermes)] hover:underline"
                      >
                        {t("journal_read_more")}
                      </a>
                    </p>

                    <p className="mt-3 text-[10px] leading-relaxed text-[color:color-mix(in_srgb,var(--espresso)_72%,#555)]">
                      <Link
                        href="/#casa-shop-the-look"
                        prefetch={false}
                        scroll
                        className="border-b border-[color:color-mix(in_srgb,var(--hermes)_35%,transparent)] font-medium tracking-[0.05em] transition-colors duration-500 hover:border-[color:var(--hermes)] hover:text-[color:var(--hermes)]"
                      >
                        {t("journal_cta_shop")}
                      </Link>
                    </p>

                    <p className="mt-3 border-t border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] pt-3">
                      <a
                        href={a.sourceHomeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted underline-offset-4 transition-colors duration-500 hover:text-[color:var(--hermes)] hover:underline"
                      >
                        {t("journal_source_visit", { label: a.sourceLabel })}
                      </a>
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
