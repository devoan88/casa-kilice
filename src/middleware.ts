import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Minimal middleware (Vercel-safe):
 * - Optional maintenance redirect (no loops)
 * - A few safe security headers (no CSP/HSTS here)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
