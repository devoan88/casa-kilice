const STORAGE_KEY = "ck_abandon_key";

/** Stable anonymous id for abandoned-cart tracking (browser only). */
export function getCartClientKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let k = window.localStorage.getItem(STORAGE_KEY);
    if (!k || k.length < 8) {
      k = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, k);
    }
    return k;
  } catch {
    return "";
  }
}

export function clearCartClientKey(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
