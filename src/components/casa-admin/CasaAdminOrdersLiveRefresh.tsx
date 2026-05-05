"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Soft “real-time”: refetches server data on an interval while the tab is visible. */
export function CasaAdminOrdersLiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 12_000);
    return () => window.clearInterval(id);
  }, [router]);

  return null;
}
