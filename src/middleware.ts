import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * EMERGENCY STABILITY MODE (Vercel 500 triage): bypass all middleware logic.
 * This rules out CSP / redirect loops / runtime errors inside middleware.
 *
 * Restore the full middleware once the site is stable.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
