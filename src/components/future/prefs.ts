export type ConciergePrefs = {
  name?: string;
  lastRecommendedId?: string;
  skinFocus?: "glow" | "hydration" | "tone";
};

export function prefsKey(userKey: string | undefined) {
  return `ck_concierge_${userKey ?? "guest"}`;
}

export function loadPrefs(userKey: string | undefined): ConciergePrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(prefsKey(userKey));
    if (!raw) return {};
    return JSON.parse(raw) as ConciergePrefs;
  } catch {
    return {};
  }
}

export function savePrefs(userKey: string | undefined, prefs: ConciergePrefs) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(prefsKey(userKey), JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

