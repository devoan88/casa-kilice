import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildContentSecurityPolicy } from "@/lib/security/headers";

type Bucket = { count: number; resetAt: number };

const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX = 25;
const SIGNUP_WINDOW_MS = 60 * 60 * 1000;
const SIGNUP_MAX = 12;
const SCAN_WINDOW_MS = 60 * 60 * 1000;
const SCAN_MAX = 5;

const authBuckets = new Map<string, Bucket>();
const signupBuckets = new Map<string, Bucket>();
const prepareBuckets = new Map<string, Bucket>();
const saasLeadBuckets = new Map<string, Bucket>();
const scanBuckets = new Map<string, Bucket>();

function clientKey(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}

function takeSlot(map: Map<string, Bucket>, key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  let b = map.get(key);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    map.set(key, b);
  }
  if (b.count >= max) return false;
  b.count += 1;
  if (map.size > 5000) {
    for (const [k, v] of map) {
      if (now > v.resetAt) map.delete(k);
    }
  }
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = clientKey(request);

  // Maintenance mode toggle (production safety switch).
  // Allow: maintenance page, Next.js internals, static assets, auth, webhooks, and admin console.
  if (process.env.CK_MAINTENANCE === "1") {
    const allow =
      pathname === "/maintenance" ||
      pathname.startsWith("/_next/") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/webhooks/") ||
      pathname.startsWith("/casa-admin") ||
      pathname.startsWith("/admin");
    if (!allow) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = "";
      return NextResponse.redirect(url, 307);
    }
  }

  if (pathname === "/api/auth/login-prepare" && request.method === "POST") {
    if (!takeSlot(prepareBuckets, ip, AUTH_WINDOW_MS, 40)) {
      return new NextResponse(JSON.stringify({ ok: false, error: "Too many attempts. Try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "900",
        },
      });
    }
  }

  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    if (!takeSlot(authBuckets, ip, AUTH_WINDOW_MS, AUTH_MAX)) {
      return new NextResponse(JSON.stringify({ error: "Too many login attempts. Try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "900",
        },
      });
    }
  }

  if (
    (pathname === "/api/saas/lead" ||
      pathname === "/api/saas/checkout" ||
      pathname === "/api/saas/subscription-checkout") &&
    request.method === "POST"
  ) {
    if (!takeSlot(saasLeadBuckets, ip, SIGNUP_WINDOW_MS, 20)) {
      return new NextResponse(JSON.stringify({ error: "Too many requests. Try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "3600",
        },
      });
    }
  }

  if (
    (pathname === "/api/signup" || pathname === "/api/muse/register") &&
    request.method === "POST"
  ) {
    if (!takeSlot(signupBuckets, `${pathname}:${ip}`, SIGNUP_WINDOW_MS, SIGNUP_MAX)) {
      return new NextResponse(JSON.stringify({ ok: false, error: "Too many requests. Try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "3600",
        },
      });
    }
  }

  // Skin scan anti-bot rate limiting (per-IP).
  // Keeps the expensive vision engine from being spammed.
  if (pathname === "/api/concierge/scan" && request.method === "POST") {
    if (!takeSlot(scanBuckets, ip, SCAN_WINDOW_MS, SCAN_MAX)) {
      return new NextResponse(JSON.stringify({ error: "Too many scans. Please wait a moment." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "3600",
        },
      });
    }
  }

  const res = NextResponse.next();
  const isDev = process.env.NODE_ENV !== "production";

  res.headers.set("X-Content-Type-Options", "nosniff");
  if (!pathname.startsWith("/embed/")) {
    res.headers.set("X-Frame-Options", "DENY");
  }
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  );

  if (!isDev && process.env.CK_DISABLE_HSTS !== "1") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  res.headers.set(
    "Content-Security-Policy",
    buildContentSecurityPolicy(isDev, pathname.startsWith("/embed/") ? { embeddable: true } : undefined),
  );

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
