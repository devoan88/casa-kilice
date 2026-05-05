"use client";

import { useId, useMemo } from "react";

import { assetUrl } from "@/lib/assetUrl";
import { CATALOG_SVG_MARKUP } from "@/lib/catalogSvgMarkup";

function scopeSvgMarkup(markup: string, prefix: string, fit: "meet" | "slice"): string {
  let s = markup.trim().replace(/^\s*<\?xml[^>]*>\s*/i, "");
  const par = fit === "slice" ? "xMidYMid slice" : "xMidYMid meet";
  s = s.replace(/^<svg\b/i, `<svg style="width:100%;height:100%;display:block" preserveAspectRatio="${par}"`);
  const ids = [...s.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of [...new Set(ids)]) {
    const scoped = `${prefix}-${id}`;
    s = s.split(`id="${id}"`).join(`id="${scoped}"`);
    s = s.split(`url(#${id})`).join(`url(#${scoped})`);
  }
  return s;
}

function catalogKey(src: string): string {
  const u = src.trim().split("?")[0] ?? "";
  if (u.startsWith("/")) return u;
  try {
    const p = new URL(u).pathname;
    return p.startsWith("/") ? p : u;
  } catch {
    return u;
  }
}

export function AssetSvg({
  src,
  className,
  alt,
  fit = "meet",
}: {
  src: string;
  className?: string;
  alt?: string;
  fit?: "meet" | "slice";
}) {
  const prefix = `k${useId().replace(/:/g, "")}`;
  const key = catalogKey(src);
  // Markup is from bundled static catalog only (never user-controlled); do not pass untrusted strings here.
  const raw = CATALOG_SVG_MARKUP[key];
  const html = useMemo(
    () => (raw ? scopeSvgMarkup(raw, prefix, fit) : null),
    [raw, prefix, fit],
  );

  if (!html) {
    return <img src={assetUrl(src)} alt={alt ?? ""} className={className} />;
  }

  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
