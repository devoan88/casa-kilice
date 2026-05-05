const IMG_RE = /<img[^>]+src=["']([^"']+)["']/i;

export function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractImageFromItem(
  description: string,
  content: string | undefined,
  enclosureUrl?: string,
  enclosureType?: string,
  mediaThumb?: unknown,
): string | undefined {
  if (enclosureUrl && enclosureType && /^image\//i.test(enclosureType)) return enclosureUrl;
  const thumb = mediaThumb as { $?: { url?: string }; url?: string } | undefined;
  if (thumb?.$?.url) return thumb.$.url;
  if (thumb && typeof thumb === "object" && "url" in thumb && typeof (thumb as { url?: string }).url === "string") {
    return (thumb as { url: string }).url;
  }
  const blob = `${content ?? ""} ${description ?? ""}`;
  const m = blob.match(IMG_RE);
  if (m?.[1]) return m[1];
  const abs = blob.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/i);
  return abs?.[0];
}

/** Editorial preview length (characters, plain text). */
export function buildSnippet(raw: string, min = 300, max = 400): string {
  const t = stripHtml(raw);
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ", min);
  const cut = lastSpace > min ? lastSpace : max;
  return `${t.slice(0, cut).trim()}…`;
}

/** Refined ~300 character preview (HTML stripped) for Journal cards. */
export function buildJuicyPreview(raw: string, maxChars = 300): string {
  const t = stripHtml(raw);
  if (t.length <= maxChars) return t;
  const slice = t.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ", Math.min(240, maxChars - 1));
  const cut = lastSpace > 200 ? lastSpace : maxChars;
  return `${t.slice(0, cut).trim()}…`;
}
