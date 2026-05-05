type CspOptions = {
  /** Allow this app to be embedded in third-party sites (B2B iframe widget only). */
  embeddable?: boolean;
};

/**
 * Browser security headers (CSP, framing, MIME sniffing, optional HSTS).
 * Tuned for Next.js + optional GA; tighten further when you drop `unsafe-inline` scripts.
 */
export function buildContentSecurityPolicy(isDev: boolean, opts?: CspOptions): string {
  const script =
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com"
      : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com";

  /** Turbopack / webpack HMR uses `ws:`/`wss:` — without this, `next dev` can show a blank page in strict browsers. */
  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://ipapi.co https://api.stripe.com"
    : "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://ipapi.co https://api.stripe.com";

  const directives = [
    "default-src 'self'",
    script,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data: https://fonts.gstatic.com",
    connectSrc,
    opts?.embeddable ? "frame-ancestors *" : "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ];
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}
