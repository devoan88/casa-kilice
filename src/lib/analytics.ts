/**
 * GA4 + local analytics bridge. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env` to enable gtag.
 * Events are mirrored to `appendMuseAnalyticsEvent` for offline export / future CRM sync.
 */

import { appendMuseAnalyticsEvent, recordAnonymousToneView, recordToneAffinity } from "@/lib/creatorMuseStore";
import type { ProductTone } from "@/lib/products";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGaEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined") return;
  const clean = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined),
  ) as Record<string, string | number | boolean>;
  appendMuseAnalyticsEvent({ type: "ga_mirror", name, params: clean, at: new Date().toISOString() });
  if (typeof window.gtag === "function") {
    window.gtag("event", name, clean);
  }
}

/** Primary membership CTA (Join the Club / Inner Circle). */
export function trackJoinClubClick(source: string) {
  trackGaEvent("join_club_click", { source });
}

/** Home hero tone tab / arrow navigation — GA4 + anonymous aggregate (+ optional signed-in muse profile). */
export function trackToneViewed(tone: ProductTone, opts?: { creatorEmail?: string | null }) {
  recordAnonymousToneView(tone);
  if (opts?.creatorEmail) recordToneAffinity(opts.creatorEmail, tone);
  trackGaEvent("tone_view", { tone });
}

/** Creator muse portal — file queue submitted for PR. */
export function trackCreatorUploadSubmitted(fileCount: number) {
  trackGaEvent("creator_upload_submit", { file_count: fileCount });
}
