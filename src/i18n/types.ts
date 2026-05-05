export type Locale = "en" | "ka" | "de";

export const LOCALES: Locale[] = ["en", "ka", "de"];

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "EN",
  ka: "GE",
  de: "DE",
};

export const LOCALE_STORAGE = "ck_locale";
