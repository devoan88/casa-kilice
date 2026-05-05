/** Normalize allowed domain/origin entries from CSV (host or full origin). */
export function parseAllowedOrigins(csv: string | null | undefined): string[] {
  if (!csv?.trim()) return [];
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      try {
        if (entry.includes("://")) {
          const u = new URL(entry);
          return `${u.protocol}//${u.host}`;
        }
        return `https://${entry.replace(/^\/+/, "")}`;
      } catch {
        return entry.startsWith("http") ? entry : `https://${entry}`;
      }
    });
}

export function originMatchesAllowed(requestOrigin: string | null, allowed: string[]): boolean {
  if (!requestOrigin || allowed.length === 0) return false;
  if (allowed.includes(requestOrigin)) return true;
  try {
    const o = new URL(requestOrigin);
    const host = `${o.protocol}//${o.host}`;
    if (allowed.includes(host)) return true;
    return allowed.some((a) => {
      try {
        const u = new URL(a);
        return u.host === o.host;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}
