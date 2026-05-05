import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * TEMP (500 diagnostics): middleware gutted — pass-through only.
 * Restore full middleware from git history when the site is stable again.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
