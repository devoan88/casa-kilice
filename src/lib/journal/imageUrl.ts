/**
 * Normalise and validate hero image URLs from RSS/HTML for safe use with next/image.
 */

function decodeBasicEntities(s: string): string {
  return s
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

/**
 * Returns an absolute https URL, or undefined if unusable.
 * Resolves protocol-relative and root-relative URLs when possible.
 */
export function normalizeJournalImageUrl(
  raw: string | undefined,
  articleLink: string,
  publicationHomeUrl: string,
): string | undefined {
  if (!raw?.trim()) return undefined;
  let t = decodeBasicEntities(raw.trim());
  if (t.startsWith("//")) t = `https:${t}`;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    if (u.protocol === "http:" && process.env.NODE_ENV === "production") {
      return u.href.replace(/^http:/, "https:");
    }
    return u.href;
  } catch {
    /* relative */
  }
  if (t.startsWith("/")) {
    try {
      const base = new URL(publicationHomeUrl);
      return new URL(t, `${base.origin}/`).href;
    } catch {
      try {
        return new URL(t, new URL(articleLink).origin).href;
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}
