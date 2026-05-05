"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const ac = new AbortController();
    // Defer so first paint / hydration is never blocked by /api/track or geo.
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
        }),
        signal: ac.signal,
      }).catch(() => {});
    }, 600);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      ac.abort();
    };
  }, [pathname]);

  return null;
}

