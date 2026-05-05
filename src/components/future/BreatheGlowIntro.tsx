"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function BreatheGlowIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show once per tab session. Do not write sessionStorage until the intro
    // finishes — otherwise React Strict Mode's double mount leaves the overlay
    // stuck (second run returns early and the first timeout was cleared).
    const key = "ck_intro_seen";
    try {
      if (sessionStorage.getItem(key) === "1") return;
    } catch {
      return;
    }

    let cancelled = false;
    setShow(true);
    const t = window.setTimeout(() => {
      if (cancelled) return;
      setShow(false);
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    }, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[300] grid place-items-center bg-background"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="relative flex flex-col items-center">
            <motion.div
              className="h-20 w-20 rounded-full border border-[color:color-mix(in_srgb,var(--hermes)_35%,var(--gold)_65%)]"
              animate={{ scale: [0.98, 1.05, 0.98], opacity: [0.35, 0.12, 0.35] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute h-20 w-20 rounded-full bg-[color:color-mix(in_srgb,var(--hermes)_25%,var(--gold)_75%)] blur-2xl"
              animate={{ opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.p
              className="mt-6 text-xs tracking-[0.34em] uppercase text-muted"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            >
              Breathe &amp; Glow
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

