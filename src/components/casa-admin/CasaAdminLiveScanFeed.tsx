"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type LiveItem = {
  id: string;
  createdAt: string;
  userEmail: string | null;
  userName: string | null;
  hasPhoto: boolean;
  primaryProductSlug: string | null;
  gender: string | null;
  undertone: string | null;
  analysisSource: string | null;
  aiPreview: string;
};

export function CasaAdminLiveScanFeed() {
  const [items, setItems] = useState<LiveItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const prevIds = useRef<Set<string>>(new Set());

  const tick = useCallback(async () => {
    try {
      const r = await fetch("/api/casa-admin/consultations/live", { cache: "no-store" });
      if (!r.ok) {
        setError(r.status === 403 ? "Session expired — refresh." : "Could not load live feed.");
        return;
      }
      const j = (await r.json()) as { items: LiveItem[] };
      const next = j.items ?? [];
      const newTop = next[0]?.id;
      if (newTop && !prevIds.current.has(newTop) && prevIds.current.size > 0) {
        setPulse(true);
        window.setTimeout(() => setPulse(false), 1200);
      }
      prevIds.current = new Set(next.map((x) => x.id));
      setItems(next);
      setError(null);
    } catch {
      setError("Network error.");
    }
  }, []);

  useEffect(() => {
    void tick();
    const id = window.setInterval(() => void tick(), 4000);
    return () => window.clearInterval(id);
  }, [tick]);

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,rgba(212,175,55)_35%,transparent)] bg-[color:color-mix(in_srgb,#0a0908_92%,#000)] p-6 shadow-[0_0_40px_rgba(212,175,55,0.08)] transition-shadow duration-500 ${
        pulse ? "shadow-[0_0_48px_rgba(212,175,55,0.22)]" : ""
      }`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[color:color-mix(in_srgb,rgba(212,175,55)_12%,transparent)] blur-3xl" aria-hidden />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:color-mix(in_srgb,rgba(212,175,55)_88%,#ccc)]">
            Live scan feed
          </h2>
          <p className="mt-1 text-xs text-[color:color-mix(in_srgb,#e8dfd4_65%,transparent)]">
            Polls every 4s · photo, gender read, product slug, AI preview, engine source.
          </p>
        </div>
        <Link
          href="/casa-admin/consultations"
          className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:color-mix(in_srgb,rgba(212,175,55)_95%,#fff)] underline-offset-4 hover:underline"
        >
          Full log →
        </Link>
      </div>

      {error ? <p className="relative mt-4 text-sm text-amber-200/90">{error}</p> : null}

      <ul className="relative mt-5 max-h-[min(52vh,28rem)] space-y-3 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {items.map((it, idx) => (
            <motion.li
              key={it.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.03, 0.25) }}
              className="rounded-xl border border-[color:color-mix(in_srgb,#fff_08%,transparent)] bg-[color:color-mix(in_srgb,#12100e_90%,transparent)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                <p className="text-[11px] font-medium text-[color:color-mix(in_srgb,#f5f0ea_92%,transparent)]">
                  {it.userEmail ?? "—"}
                </p>
                <time className="text-[10px] tabular-nums text-[color:color-mix(in_srgb,#e8dfd4_45%,transparent)]" dateTime={it.createdAt}>
                  {new Date(it.createdAt).toLocaleString()}
                </time>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.16em] text-[color:color-mix(in_srgb,rgba(212,175,55)_75%,#888)]">
                {it.hasPhoto ? <span className="rounded-full border border-[color:color-mix(in_srgb,rgba(212,175,55)_40%,transparent)] px-2 py-0.5">Photo</span> : null}
                <span className="rounded-full border border-[color:color-mix(in_srgb,#fff_10%,transparent)] px-2 py-0.5">
                  Gender: {it.gender ?? "—"}
                </span>
                {it.undertone ? (
                  <span className="rounded-full border border-[color:color-mix(in_srgb,#fff_10%,transparent)] px-2 py-0.5">{it.undertone}</span>
                ) : null}
                {it.analysisSource ? (
                  <span className="rounded-full border border-[color:color-mix(in_srgb,#fff_10%,transparent)] px-2 py-0.5">{it.analysisSource}</span>
                ) : null}
                {it.primaryProductSlug ? (
                  <span className="rounded-full border border-[color:color-mix(in_srgb,rgba(212,175,55)_45%,transparent)] px-2 py-0.5">{it.primaryProductSlug}</span>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[color:color-mix(in_srgb,#e8dfd4_72%,transparent)]">{it.aiPreview}</p>
            </motion.li>
          ))}
        </AnimatePresence>
        {items.length === 0 && !error ? (
          <li className="py-8 text-center text-sm text-[color:color-mix(in_srgb,#e8dfd4_45%,transparent)]">Waiting for scans…</li>
        ) : null}
      </ul>
    </section>
  );
}
