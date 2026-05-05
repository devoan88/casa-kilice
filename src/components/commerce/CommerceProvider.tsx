"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { staticCommerceFallback, type CommerceRates } from "@/lib/commerceConstants";

type Ctx = { rates: CommerceRates; loading: boolean };

const CommerceContext = createContext<Ctx | null>(null);

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<CommerceRates>(staticCommerceFallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/commerce", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; rates?: CommerceRates };
        if (!cancelled && data?.ok && data.rates) {
          setRates(data.rates);
        }
      } catch {
        /* keep fallback */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ rates, loading }), [rates, loading]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerceRates() {
  const ctx = useContext(CommerceContext);
  if (!ctx) {
    return { rates: staticCommerceFallback, loading: false };
  }
  return ctx;
}
