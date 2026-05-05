"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Locale } from "@/i18n/types";
import { LOCALE_STORAGE, LOCALES } from "@/i18n/types";

function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  try {
    const maxAge = 60 * 60 * 24 * 400;
    document.cookie = `${LOCALE_STORAGE}=${encodeURIComponent(locale)};path=/;max-age=${maxAge};SameSite=Lax`;
  } catch {
    /* ignore */
  }
}
import { formatMessage, type MessageKey } from "@/i18n/messages";

export type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

function normalizeInitialLocale(value: Locale | undefined): Locale {
  if (value && LOCALES.includes(value)) return value;
  return "en";
}

const LanguageContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE);
    if (raw && (LOCALES as readonly string[]).includes(raw)) return raw as Locale;
  } catch {
    // ignore
  }
  return "en";
}

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  /** From `cookies().get(LOCALE_STORAGE)` so first paint matches SSR (avoids hydration mismatch). */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() => normalizeInitialLocale(initialLocale));

  useEffect(() => {
    setLocaleState((prev) => {
      const stored = readStoredLocale();
      if (stored === prev) return prev;
      if (stored !== "en") return stored;
      return prev;
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeLocaleCookie(l);
    try {
      localStorage.setItem(LOCALE_STORAGE, l);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute(
      "lang",
      locale === "ka" ? "ka" : locale === "de" ? "de" : "en",
    );
    html.classList.remove("lang-en", "lang-ka", "lang-de");
    html.classList.add(`lang-${locale}`);
  }, [locale]);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) =>
      formatMessage(locale, key, vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
