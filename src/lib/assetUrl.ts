/**
 * Prefix for static files under `public/`. Use when `basePath` is set in `next.config`.
 * Set `NEXT_PUBLIC_BASE_PATH` to the same value as `basePath` (e.g. `/my-app`).
 */
export function assetUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  return base ? `${base}${p}` : p;
}
