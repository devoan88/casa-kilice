/**
 * Client-side store for Muse / creator data — structured for later email marketing
 * and “Shop the Look” pipelines (export JSON from `getMuseAnalyticsExport`).
 */

import type { ProductTone } from "@/lib/products";

const MARKETING_KEY = "ck_muse_marketing_v1";
const ANALYTICS_KEY = "ck_muse_analytics_events_v1";
const TONE_AGG_KEY = "ck_home_tone_aggregate_v1";
const MAX_EVENTS = 200;

export type MuseMarketingProfile = {
  email: string;
  displayName?: string;
  /** Opt-in for campaigns (set true on register in portal). */
  marketingOptIn: boolean;
  /** Aggregated tone interest from home hero. */
  toneAffinity: Partial<Record<ProductTone, number>>;
  uploadsTotal: number;
  lastUploadAt?: string;
  updatedAt: string;
};

export type MuseAnalyticsEvent = {
  type: "ga_mirror" | "profile_upsert" | "upload_queue";
  name?: string;
  params?: Record<string, string | number | boolean>;
  at: string;
};

type MarketingRoot = { profiles: MuseMarketingProfile[] };

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function upsertMuseMarketingProfile(patch: Omit<MuseMarketingProfile, "toneAffinity" | "updatedAt"> & {
  toneAffinity?: Partial<Record<ProductTone, number>>;
}) {
  const root = readJson<MarketingRoot>(MARKETING_KEY, { profiles: [] });
  const idx = root.profiles.findIndex((p) => p.email === patch.email);
  const prev = idx >= 0 ? root.profiles[idx]! : undefined;
  const toneAffinity = {
    ...(prev?.toneAffinity ?? {}),
    ...(patch.toneAffinity ?? {}),
  };
  const next: MuseMarketingProfile = {
    email: patch.email,
    displayName: patch.displayName ?? prev?.displayName,
    marketingOptIn: patch.marketingOptIn,
    toneAffinity,
    uploadsTotal: patch.uploadsTotal ?? prev?.uploadsTotal ?? 0,
    lastUploadAt: patch.lastUploadAt ?? prev?.lastUploadAt,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) root.profiles[idx] = next;
  else root.profiles.push(next);
  writeJson(MARKETING_KEY, root);
  appendMuseAnalyticsEvent({ type: "profile_upsert", at: next.updatedAt, params: { email: patch.email } });
}

export function recordToneAffinity(email: string | null, tone: ProductTone) {
  if (!email) return;
  const root = readJson<MarketingRoot>(MARKETING_KEY, { profiles: [] });
  const p = root.profiles.find((x) => x.email === email);
  const toneAffinity = { ...(p?.toneAffinity ?? {}), [tone]: (p?.toneAffinity?.[tone] ?? 0) + 1 };
  upsertMuseMarketingProfile({
    email,
    displayName: p?.displayName,
    marketingOptIn: p?.marketingOptIn ?? true,
    toneAffinity,
    uploadsTotal: p?.uploadsTotal ?? 0,
    lastUploadAt: p?.lastUploadAt,
  });
}

export function incrementMuseUploads(email: string, count: number) {
  const root = readJson<MarketingRoot>(MARKETING_KEY, { profiles: [] });
  const p = root.profiles.find((x) => x.email === email);
  upsertMuseMarketingProfile({
    email,
    displayName: p?.displayName,
    marketingOptIn: p?.marketingOptIn ?? true,
    toneAffinity: p?.toneAffinity,
    uploadsTotal: (p?.uploadsTotal ?? 0) + count,
    lastUploadAt: new Date().toISOString(),
  });
  appendMuseAnalyticsEvent({
    type: "upload_queue",
    at: new Date().toISOString(),
    params: { email, count },
  });
}

/** Anonymous home-hero tone popularity (no PII) — exportable with `getMuseAnalyticsExport`. */
export function recordAnonymousToneView(tone: ProductTone) {
  const o = readJson<Record<ProductTone, number>>(TONE_AGG_KEY, { light: 0, bronzer: 0, deep: 0 });
  o[tone] = (o[tone] ?? 0) + 1;
  writeJson(TONE_AGG_KEY, o);
}

export function getToneAggregate() {
  return readJson<Record<ProductTone, number>>(TONE_AGG_KEY, { light: 0, bronzer: 0, deep: 0 });
}

export function appendMuseAnalyticsEvent(event: MuseAnalyticsEvent) {
  if (typeof window === "undefined") return;
  const list = readJson<MuseAnalyticsEvent[]>(ANALYTICS_KEY, []);
  list.push(event);
  writeJson(ANALYTICS_KEY, list.slice(-MAX_EVENTS));
}

export function getMuseAnalyticsExport() {
  return {
    marketing: readJson<MarketingRoot>(MARKETING_KEY, { profiles: [] }),
    events: readJson<MuseAnalyticsEvent[]>(ANALYTICS_KEY, []),
    toneAggregate: getToneAggregate(),
  };
}
